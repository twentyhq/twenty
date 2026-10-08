import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type Repository } from 'typeorm';

import type Stripe from 'stripe';

import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { PAYMENT_RECEIVED_EVENT } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/billing/payment-received';
import { getCustomerIdFromInvoice } from 'src/engine/core-modules/billing-webhook/utils/get-customer-id-from-invoice.util';
import { getSubscriptionIdFromInvoice } from 'src/engine/core-modules/billing-webhook/utils/get-subscription-id-from-invoice.util';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingWebhookEvent } from 'src/engine/core-modules/billing/enums/billing-webhook-events.enum';
import { BillingCreditGrantService } from 'src/engine/core-modules/billing/services/billing-credit-grant.service';
import { BillingCreditRolloverService } from 'src/engine/core-modules/billing/services/billing-credit-rollover.service';
import { BillingCreditOneTimeTopUpService } from 'src/engine/core-modules/billing/services/billing-credit-one-time-top-up.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { ResourceCreditService } from 'src/engine/core-modules/billing/services/resource-credit.service';
import { StripeInvoiceService } from 'src/engine/core-modules/billing/stripe/services/stripe-invoice.service';
import { deriveBillingPeriodTransition } from 'src/engine/core-modules/billing/utils/derive-billing-period-transition.util';
import { isCreditTopUpInvoice } from 'src/engine/core-modules/billing/utils/is-credit-top-up-invoice.util';
import { resolveBillingTransitionBoundary } from 'src/engine/core-modules/billing/utils/resolve-billing-transition-boundary.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const SUBSCRIPTION_CYCLE_BILLING_REASON = 'subscription_cycle';

@Injectable()
export class BillingWebhookInvoiceService {
  protected readonly logger = new Logger(BillingWebhookInvoiceService.name);

  constructor(
    // Stripe webhook: workspace discovered from BillingCustomer by stripeCustomerId.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: Repository<BillingCustomerEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingCreditGrantService: BillingCreditGrantService,
    private readonly billingCreditRolloverService: BillingCreditRolloverService,
    private readonly billingCreditOneTimeTopUpService: BillingCreditOneTimeTopUpService,
    private readonly billingUsageService: BillingUsageService,
    private readonly resourceCreditService: ResourceCreditService,
    private readonly stripeInvoiceService: StripeInvoiceService,
    private readonly eventLogEmitterService: EventLogEmitterService,
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
      created: invoiceCreatedAtInSeconds,
    } = data.object;

    const stripeSubscriptionId = getSubscriptionIdFromInvoice(data.object);
    const stripeCustomerId = getCustomerIdFromInvoice(data.object);

    if (
      !isDefined(stripeSubscriptionId) ||
      billingReason !== SUBSCRIPTION_CYCLE_BILLING_REASON
    ) {
      return;
    }

    if (!isDefined(stripeCustomerId)) {
      return;
    }

    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscription({
        stripeCustomerId,
      });

    if (!isDefined(subscription)) {
      return;
    }

    await this.processRollover({
      subscription,
      // Stripe's own clock, comparable to subscription boundaries without skew
      invoiceCreatedAt: new Date(invoiceCreatedAtInSeconds * 1000),
    });
  }

  private async processRollover({
    subscription,
    invoiceCreatedAt,
  }: {
    subscription: BillingSubscriptionEntity;
    invoiceCreatedAt: Date;
  }): Promise<void> {
    const workspaceExists = await this.workspaceRepository.exists({
      where: { id: subscription.workspaceId },
      withDeleted: true,
    });

    if (!workspaceExists) {
      return;
    }

    const params =
      await this.resourceCreditService.getResourceCreditRolloverParameters(
        subscription.workspaceId,
        subscription.id,
      );

    // Skipping the transition forfeits the unspent part of every grant of this workspace
    if (!isDefined(params)) {
      this.logger.error(
        `Skipping credit rollover for workspace ${subscription.workspaceId}: subscription ${subscription.id} carries no priced resource credit item`,
      );

      return;
    }

    const boundary = resolveBillingTransitionBoundary({
      invoiceCreatedAt,
      subscriptionCurrentPeriodStart: subscription.currentPeriodStart,
      subscriptionCurrentPeriodEnd: subscription.currentPeriodEnd,
    });

    // Only needed while subscriptions predating previousPeriodStart transition for the first time
    const ledgerPeriodStart =
      await this.billingCreditGrantService.findPeriodStartBefore({
        workspaceId: subscription.workspaceId,
        boundary,
      });

    const {
      closingPeriodStart,
      closingPeriodEnd,
      nextPeriodStart,
      isFirstPeriodAfterTrial,
    } = deriveBillingPeriodTransition({
      boundary,
      subscriptionCurrentPeriodStart: subscription.currentPeriodStart,
      subscriptionInterval: subscription.interval,
      trialStart: subscription.trialStart,
      trialEnd: subscription.trialEnd,
      subscriptionPreviousPeriodStart: subscription.previousPeriodStart,
      ledgerPeriodStart,
    });

    // Trial credits carry into the first paid period; the trial allowance comes from config, not the price
    const closingAllowanceMicro = isFirstPeriodAfterTrial
      ? this.billingUsageService.getTrialResourceUsageCap(subscription)
      : params.tierQuantity;

    await this.billingCreditRolloverService.processRolloverOnPeriodTransition({
      workspaceId: subscription.workspaceId,
      closingPeriodStart,
      closingPeriodEnd,
      closingAllowanceMicro,
      nextPeriodStart,
      nextAllowanceMicro: params.tierQuantity,
    });
  }

  private async processInvoicePaid(data: Stripe.InvoicePaidEvent.Data) {
    if (isCreditTopUpInvoice(data.object)) {
      return this.processCreditTopUpInvoicePaid(data.object);
    }

    const stripeSubscriptionId = getSubscriptionIdFromInvoice(data.object);
    const stripeCustomerId = getCustomerIdFromInvoice(data.object);
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

    // Stripe won't reactivate on a paid past-due invoice while a next-period draft exists
    await this.finalizePastDueDraftInvoicesAfterPaidInvoice(
      stripeSubscriptionId,
      paidInvoicePeriodEnd,
    );

    const billingCustomer = await this.billingCustomerRepository.findOne({
      where: { stripeCustomerId },
    });

    if (isDefined(billingCustomer)) {
      await this.delaySuspendedWorkspaceCleanup(billingCustomer);

      void this.eventLogEmitterService
        .createContext({ workspaceId: billingCustomer.workspaceId })
        .insertWorkspaceEvent(PAYMENT_RECEIVED_EVENT, {
          amountPaid: data.object.amount_paid,
        });
    }

    return { stripeSubscriptionId };
  }

  private async processCreditTopUpInvoicePaid(invoice: Stripe.Invoice) {
    const workspaceId =
      await this.billingCreditOneTimeTopUpService.grantPurchasedCreditsForPaidInvoice(
        invoice,
      );

    if (isDefined(workspaceId)) {
      void this.eventLogEmitterService
        .createContext({ workspaceId })
        .insertWorkspaceEvent(PAYMENT_RECEIVED_EVENT, {
          amountPaid: invoice.amount_paid,
        });
    }

    return { stripeInvoiceId: invoice.id };
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
