import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import type Stripe from 'stripe';

import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingCreditRolloverService } from 'src/engine/core-modules/billing/services/billing-credit-rollover.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';

const SUBSCRIPTION_CYCLE_BILLING_REASON = 'subscription_cycle';

@Injectable()
export class BillingWebhookInvoiceService {
  protected readonly logger = new Logger(BillingWebhookInvoiceService.name);
  constructor(
    @InjectRepository(BillingSubscriptionItemEntity)
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItemEntity>,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingCreditRolloverService: BillingCreditRolloverService,
  ) {}

  async processStripeEvent(data: Stripe.InvoiceFinalizedEvent.Data) {
    const {
      billing_reason: billingReason,
      customer,
      parent,
      period_start: periodStart,
      period_end: periodEnd,
    } = data.object;

    // In Stripe SDK v19+, subscription moved to invoice.parent.subscription_details.subscription
    // Fall back to invoice.subscription for standard subscription invoices
    const stripeSubscriptionId = (parent?.subscription_details?.subscription ??
      (data.object as unknown as { subscription?: string }).subscription) as
      | string
      | undefined;
    const stripeCustomerId = customer as string | undefined;

    if (
      isDefined(stripeSubscriptionId) &&
      billingReason === SUBSCRIPTION_CYCLE_BILLING_REASON
    ) {
      await this.billingSubscriptionItemRepository.update(
        { stripeSubscriptionId },
        { hasReachedCurrentPeriodCap: false },
      );

      if (isDefined(stripeCustomerId) && periodStart && periodEnd) {
        await this.processRollover(
          stripeCustomerId,
          new Date(periodStart * 1000),
          new Date(periodEnd * 1000),
        );
      }

      if (isDefined(stripeCustomerId) && periodEnd) {
        // Pass the new period start (which is the invoiced period's end) for alert threshold calculation
        await this.billingSubscriptionService.createBillingAlertForCustomer(
          stripeCustomerId,
          new Date(periodEnd * 1000),
        );
      }
    }
  }

  private async processRollover(
    stripeCustomerId: string,
    invoicedPeriodStart: Date,
    invoicedPeriodEnd: Date,
  ): Promise<void> {
    try {
      const subscription =
        await this.billingSubscriptionService.getCurrentBillingSubscription({
          stripeCustomerId,
        });

      if (!isDefined(subscription)) {
        this.logger.warn(
          `Cannot process rollover: subscription not found for customer ${stripeCustomerId}`,
        );

        return;
      }

      const rolloverParams =
        await this.billingCreditRolloverService.getWorkflowRolloverParameters(
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

      await this.billingCreditRolloverService.processRolloverOnPeriodTransition(
        {
          stripeCustomerId,
          subscriptionId: subscription.id,
          stripeMeterId: rolloverParams.stripeMeterId,
          previousPeriodStart: invoicedPeriodStart,
          previousPeriodEnd: invoicedPeriodEnd,
          newPeriodEnd: nextPeriodEnd,
          tierQuantity: rolloverParams.tierQuantity,
          unitPriceCents: rolloverParams.unitPriceCents,
        },
      );
    } catch (error) {
      this.logger.error(
        `Error processing rollover for customer ${stripeCustomerId}: ${error}`,
      );
    }
  }

  private calculateNextPeriodEnd(
    periodEnd: Date,
    interval: SubscriptionInterval,
  ): Date {
    const result = new Date(periodEnd);

    if (interval === SubscriptionInterval.Year) {
      result.setFullYear(result.getFullYear() + 1);
    } else {
      result.setMonth(result.getMonth() + 1);
    }

    return result;
  }
}
