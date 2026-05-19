import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type Repository } from 'typeorm';

import type Stripe from 'stripe';

import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { PAYMENT_RECEIVED_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/billing/payment-received';
import { getSubscriptionIdFromInvoice } from 'src/engine/core-modules/billing-webhook/utils/get-subscription-id-from-invoice.util';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingWebhookEvent } from 'src/engine/core-modules/billing/enums/billing-webhook-events.enum';
import { BillingCreditRolloverService } from 'src/engine/core-modules/billing/services/billing-credit-rollover.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { ResourceCreditService } from 'src/engine/core-modules/billing/services/resource-credit.service';
import { StripeInvoiceService } from 'src/engine/core-modules/billing/stripe/services/stripe-invoice.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const SUBSCRIPTION_CYCLE_BILLING_REASON = 'subscription_cycle';

@Injectable()
export class BillingWebhookInvoiceService {
  protected readonly logger = new Logger(BillingWebhookInvoiceService.name);

  constructor(
    @InjectRepository(BillingSubscriptionItemEntity)
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItemEntity>,
    @InjectRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: Repository<BillingCustomerEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingCreditRolloverService: BillingCreditRolloverService,
    private readonly resourceCreditService: ResourceCreditService,
    private readonly stripeInvoiceService: StripeInvoiceService,
    private readonly auditService: AuditService,
  ) {}

  async processStripeEvent(
    event: Stripe.InvoicePaidEvent | Stripe.InvoiceFinalizedEvent,
  ) {
    if (event.type === BillingWebhookEvent.INVOICE_PAID) {
      return this.processInvoicePaid(
        event.data as Stripe.InvoicePaidEvent.Data,
      );
    }

    if (event.type === BillingWebhookEvent.INVOICE_FINALIZED) {
      return this.processInvoiceFinalized(
        event.data as Stripe.InvoiceFinalizedEvent.Data,
      );
    }
  }

  private async processInvoiceFinalized(
    data: Stripe.InvoiceFinalizedEvent.Data,
  ) {
    const {
      billing_reason: billingReason,
      customer,
      period_start: periodStart,
      period_end: periodEnd,
    } = data.object;

    const stripeSubscriptionId = getSubscriptionIdFromInvoice(data.object);
    const stripeCustomerId = customer as string | undefined;

    if (
      !isDefined(stripeSubscriptionId) ||
      billingReason !== SUBSCRIPTION_CYCLE_BILLING_REASON
    ) {
      return;
    }

    await this.billingSubscriptionItemRepository.update(
      { stripeSubscriptionId },
      { hasReachedCurrentPeriodCap: false },
    );

    if (!isDefined(stripeCustomerId) || !periodEnd) {
      return;
    }

    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscription({
        stripeCustomerId,
      });

    if (!isDefined(subscription)) {
      return;
    }

    const trialEnd = isDefined(subscription.trialEnd)
      ? Math.floor(subscription.trialEnd.getTime() / 1000)
      : undefined;

    const TRIAL_END_TOLERANCE_SECONDS = 60;

    const isFirstPeriodAfterTrial =
      isDefined(trialEnd) &&
      isDefined(periodStart) &&
      Math.abs(periodStart - trialEnd) <= TRIAL_END_TOLERANCE_SECONDS;

    if (periodStart && !isFirstPeriodAfterTrial) {
      await this.processRollover(subscription, new Date(periodStart * 1000));
    }
  }

  private async processRollover(
    subscription: BillingSubscriptionEntity,
    invoicedPeriodStart: Date,
  ): Promise<void> {
    const params =
      await this.resourceCreditService.getResourceCreditRolloverParameters(
        subscription.id,
      );

    if (!isDefined(params)) {
      return;
    }

    await this.billingCreditRolloverService.processRolloverOnPeriodTransition({
      workspaceId: subscription.workspaceId,
      stripeCustomerId: subscription.stripeCustomerId,
      tierQuantity: params.tierQuantity,
      previousPeriodStart: invoicedPeriodStart,
    });
  }

  private async processInvoicePaid(data: Stripe.InvoicePaidEvent.Data) {
    const stripeSubscriptionId = getSubscriptionIdFromInvoice(data.object);
    const stripeCustomerId = data.object.customer as string | undefined;
    const paidInvoicePeriodEnd = data.object.period_end;

    if (
      !isDefined(stripeSubscriptionId) ||
      !isDefined(stripeCustomerId) ||
      !isDefined(paidInvoicePeriodEnd)
    ) {
      throw new BillingException(
        'Invalid invoice paid event data',
        BillingExceptionCode.BILLING_STRIPE_ERROR,
      );
    }

    // Paying a past-due invoice won't reactivate the subscription if Stripe
    // already generated a draft for the next period. Finalize it so Stripe
    // can collect payment and resume the subscription.
    await this.finalizePastDueDraftInvoicesAfterPaidInvoice(
      stripeSubscriptionId,
      paidInvoicePeriodEnd,
    );

    const billingCustomer = await this.billingCustomerRepository.findOne({
      where: { stripeCustomerId },
    });

    if (isDefined(billingCustomer)) {
      await this.delaySuspendedWorkspaceCleanup(billingCustomer);

      await this.auditService
        .createContext({ workspaceId: billingCustomer.workspaceId })
        .insertWorkspaceEvent(PAYMENT_RECEIVED_EVENT, {
          amountPaid: data.object.amount_paid,
        });
    }

    return { stripeSubscriptionId };
  }

  private async finalizePastDueDraftInvoicesAfterPaidInvoice(
    stripeSubscriptionId: string,
    paidInvoicePeriodEnd: number,
  ): Promise<void> {
    const draftInvoices =
      await this.stripeInvoiceService.listDraftInvoices(stripeSubscriptionId);

    const nowInSeconds = Date.now() / 1000;

    const pastDueDraftInvoices = draftInvoices.filter(
      (invoice) =>
        isDefined(invoice.period_end) &&
        invoice.period_end > paidInvoicePeriodEnd &&
        invoice.period_end < nowInSeconds,
    );

    for (const invoice of pastDueDraftInvoices) {
      try {
        await this.stripeInvoiceService.finalizeInvoice(invoice.id);
      } catch (error) {
        throw new BillingException(
          `Failed to finalize draft invoice ${invoice.id}: ${error.message}`,
          BillingExceptionCode.BILLING_STRIPE_ERROR,
        );
      }
    }
  }

  private async delaySuspendedWorkspaceCleanup(
    billingCustomer: BillingCustomerEntity,
  ): Promise<void> {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: billingCustomer.workspaceId,
        activationStatus: WorkspaceActivationStatus.SUSPENDED,
      },
    });

    if (!isDefined(workspace)) {
      return;
    }

    await this.workspaceRepository.update(workspace.id, {
      suspendedAt: new Date(),
    });
  }
}
