import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import type Stripe from 'stripe';

import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingCreditRolloverService } from 'src/engine/core-modules/billing/services/billing-credit-rollover.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

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

    // In Stripe SDK v19+, subscription moved from invoice.subscription to invoice.parent.subscription_details.subscription
    const stripeSubscriptionId =
      parent?.subscription_details?.subscription as string | undefined;
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

      if (isDefined(stripeCustomerId)) {
        await this.billingSubscriptionService.createBillingAlertForCustomer(
          stripeCustomerId,
        );
      }
    }
  }

  private async processRollover(
    stripeCustomerId: string,
    newPeriodStart: Date,
    newPeriodEnd: Date,
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

      const previousPeriodEnd = newPeriodStart;
      const previousPeriodStart = this.calculatePreviousPeriodStart(
        previousPeriodEnd,
        subscription.interval,
      );

      await this.billingCreditRolloverService.processRolloverOnPeriodTransition(
        {
          stripeCustomerId,
          subscriptionId: subscription.id,
          stripeMeterId: rolloverParams.stripeMeterId,
          previousPeriodStart,
          previousPeriodEnd,
          newPeriodEnd,
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

  private calculatePreviousPeriodStart(
    periodEnd: Date,
    interval: SubscriptionInterval,
  ): Date {
    const result = new Date(periodEnd);

    if (interval === SubscriptionInterval.Year) {
      result.setFullYear(result.getFullYear() - 1);
    } else {
      result.setMonth(result.getMonth() - 1);
    }

    return result;
  }
}
