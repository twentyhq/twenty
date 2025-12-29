import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { addMonths, addYears } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import type Stripe from 'stripe';

import { getSubscriptionIdFromInvoice } from 'src/engine/core-modules/billing-webhook/utils/get-subscription-id-from-invoice.util';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingCreditRolloverService } from 'src/engine/core-modules/billing/services/billing-credit-rollover.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { MeteredCreditService } from 'src/engine/core-modules/billing/services/metered-credit.service';

const SUBSCRIPTION_CYCLE_BILLING_REASON = 'subscription_cycle';

@Injectable()
export class BillingWebhookInvoiceService {
  constructor(
    @InjectRepository(BillingSubscriptionItemEntity)
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItemEntity>,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingCreditRolloverService: BillingCreditRolloverService,
    private readonly meteredCreditService: MeteredCreditService,
  ) {}

  async processStripeEvent(data: Stripe.InvoiceFinalizedEvent.Data) {
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
