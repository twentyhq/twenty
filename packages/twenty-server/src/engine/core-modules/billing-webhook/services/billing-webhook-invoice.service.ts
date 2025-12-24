import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import type Stripe from 'stripe';

import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionItemService } from 'src/engine/core-modules/billing/services/billing-subscription-item.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeBillingAlertService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-alert.service';

const SUBSCRIPTION_CYCLE_BILLING_REASON = 'subscription_cycle';

@Injectable()
export class BillingWebhookInvoiceService {
  protected readonly logger = new Logger(BillingWebhookInvoiceService.name);
  constructor(
    @InjectRepository(BillingSubscriptionItemEntity)
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItemEntity>,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingSubscriptionItemService: BillingSubscriptionItemService,
    private readonly stripeBillingAlertService: StripeBillingAlertService,
  ) {}

  async processStripeEvent(data: Stripe.InvoiceFinalizedEvent.Data) {
    const {
      billing_reason: billingReason,
      subscription,
      customer,
    } = data.object;

    const stripeSubscriptionId = subscription as string | undefined;
    const stripeCustomerId = customer as string | undefined;

    if (
      isDefined(stripeSubscriptionId) &&
      billingReason === SUBSCRIPTION_CYCLE_BILLING_REASON
    ) {
      await this.billingSubscriptionItemRepository.update(
        { stripeSubscriptionId },
        { hasReachedCurrentPeriodCap: false },
      );

      if (isDefined(stripeCustomerId)) {
        await this.createBillingAlertForNewPeriod(
          stripeSubscriptionId,
          stripeCustomerId,
        );
      }
    }
  }

  private async createBillingAlertForNewPeriod(
    stripeSubscriptionId: string,
    stripeCustomerId: string,
  ): Promise<void> {
    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscription({
        stripeCustomerId,
      });

    if (!isDefined(subscription)) {
      this.logger.warn(
        `Cannot create billing alert: subscription not found for stripeCustomerId ${stripeCustomerId}`,
      );

      return;
    }

    const meteredItemDetails =
      await this.billingSubscriptionItemService.getMeteredSubscriptionItemDetails(
        subscription.id,
      );

    const workflowItem = meteredItemDetails.find(
      (item) => item.productKey === BillingProductKey.WORKFLOW_NODE_EXECUTION,
    );

    if (!isDefined(workflowItem)) {
      this.logger.warn(
        `Cannot create billing alert: workflow subscription item not found for subscription ${subscription.id}`,
      );

      return;
    }

    await this.stripeBillingAlertService.createUsageThresholdAlertForCustomerMeter(
      stripeCustomerId,
      workflowItem.tierQuantity,
    );
  }
}
