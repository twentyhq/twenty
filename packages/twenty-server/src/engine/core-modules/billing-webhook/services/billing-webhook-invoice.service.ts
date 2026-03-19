import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { addMonths, addYears } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type Repository } from 'typeorm';

import type Stripe from 'stripe';

import { getSubscriptionIdFromInvoice } from 'src/engine/core-modules/billing-webhook/utils/get-subscription-id-from-invoice.util';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingWebhookEvent } from 'src/engine/core-modules/billing/enums/billing-webhook-events.enum';
import { BillingCreditRolloverService } from 'src/engine/core-modules/billing/services/billing-credit-rollover.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { MeteredCreditService } from 'src/engine/core-modules/billing/services/metered-credit.service';
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
    private readonly meteredCreditService: MeteredCreditService,
    private readonly stripeInvoiceService: StripeInvoiceService,
  ) {}

  async processStripeEvent(
    data: Stripe.InvoiceFinalizedEvent.Data | Stripe.InvoicePaidEvent.Data,
    eventType: string,
  ) {
    if (eventType === BillingWebhookEvent.INVOICE_PAID) {
      return this.processInvoicePaid(data as Stripe.InvoicePaidEvent.Data);
    }

    if (eventType === BillingWebhookEvent.INVOICE_FINALIZED) {
      return this.processInvoiceFinalized(
        data as Stripe.InvoiceFinalizedEvent.Data,
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

    if (periodStart) {
      await this.processRollover(
        subscription,
        new Date(periodStart * 1000),
        new Date(periodEnd * 1000),
      );
    }

    // Pass the new period start (which is the invoiced period's end) for alert threshold calculation
    await this.meteredCreditService.recreateBillingAlertForSubscription(
      subscription,
      new Date(periodEnd * 1000),
    );
  }

  private async processRollover(
    subscription: BillingSubscriptionEntity,
    invoicedPeriodStart: Date,
    invoicedPeriodEnd: Date,
  ): Promise<void> {
    const rolloverParams =
      await this.meteredCreditService.getMeteredRolloverParameters(
        subscription.id,
      );

    if (!isDefined(rolloverParams)) {
      return;
    }

    // The invoice covers the period that just ended (invoicedPeriodStart to invoicedPeriodEnd)
    // We need to calculate unused credits from this period and roll them over
    // Credits should expire at the end of the NEXT period
    const nextPeriodEnd = this.calculateNextPeriodEnd(
      invoicedPeriodEnd,
      subscription.interval,
    );

    await this.billingCreditRolloverService.processRolloverOnPeriodTransition({
      stripeCustomerId: subscription.stripeCustomerId,
      subscriptionId: subscription.id,
      stripeMeterId: rolloverParams.stripeMeterId,
      previousPeriodStart: invoicedPeriodStart,
      previousPeriodEnd: invoicedPeriodEnd,
      newPeriodEnd: nextPeriodEnd,
      tierQuantity: rolloverParams.tierQuantity,
      unitPriceCents: rolloverParams.unitPriceCents,
    });
  }

  private async processInvoicePaid(data: Stripe.InvoicePaidEvent.Data) {
    const stripeSubscriptionId = getSubscriptionIdFromInvoice(data.object);

    if (!isDefined(stripeSubscriptionId)) {
      return;
    }

    const stripeCustomerId = data.object.customer as string | undefined;

    await this.finalizePastDueDraftInvoices(stripeSubscriptionId);

    if (isDefined(stripeCustomerId)) {
      await this.refreshSuspendedAtIfNeeded(stripeCustomerId);
    }

    return { stripeSubscriptionId };
  }

  private async finalizePastDueDraftInvoices(
    stripeSubscriptionId: string,
  ): Promise<void> {
    const draftInvoices =
      await this.stripeInvoiceService.listDraftInvoices(stripeSubscriptionId);

    const now = Date.now() / 1000;

    const pastDueDraftInvoices = draftInvoices.filter(
      (invoice) => isDefined(invoice.period_end) && invoice.period_end < now,
    );

    for (const invoice of pastDueDraftInvoices) {
      try {
        await this.stripeInvoiceService.finalizeInvoice(invoice.id);
      } catch (error) {
        this.logger.error(
          `Failed to finalize draft invoice ${invoice.id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  private async refreshSuspendedAtIfNeeded(
    stripeCustomerId: string,
  ): Promise<void> {
    const billingCustomer = await this.billingCustomerRepository.findOne({
      where: { stripeCustomerId },
    });

    if (!isDefined(billingCustomer)) {
      return;
    }

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

  private calculateNextPeriodEnd(
    periodEnd: Date,
    interval: SubscriptionInterval,
  ): Date {
    if (interval === SubscriptionInterval.Year) {
      return addYears(periodEnd, 1);
    }

    return addMonths(periodEnd, 1);
  }
}
