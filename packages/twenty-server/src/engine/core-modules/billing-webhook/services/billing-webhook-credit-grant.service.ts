/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingSubscriptionItemService } from 'src/engine/core-modules/billing/services/billing-subscription-item.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeBillingAlertService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-alert.service';
import { StripeCreditGrantService } from 'src/engine/core-modules/billing/stripe/services/stripe-credit-grant.service';

@Injectable()
export class BillingWebhookCreditGrantService {
  constructor(
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingSubscriptionItemService: BillingSubscriptionItemService,
    private readonly stripeBillingAlertService: StripeBillingAlertService,
    private readonly stripeCreditGrantService: StripeCreditGrantService,
  ) {}

  async processStripeEvent(stripeCustomerId: string): Promise<void> {
    await this.recreateBillingAlertForCustomer(stripeCustomerId);
  }

  private async recreateBillingAlertForCustomer(
    stripeCustomerId: string,
  ): Promise<void> {
    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscription({
        stripeCustomerId,
      });

    if (!isDefined(subscription)) {
      return;
    }

    const meteredDetails =
      await this.billingSubscriptionItemService.getMeteredSubscriptionItemDetails(
        subscription.id,
      );

    const workflowItem = meteredDetails.find(
      (item) => item.productKey === BillingProductKey.WORKFLOW_NODE_EXECUTION,
    );

    if (!isDefined(workflowItem)) {
      return;
    }

    const creditBalance =
      await this.stripeCreditGrantService.getCustomerCreditBalance(
        stripeCustomerId,
        workflowItem.unitPriceCents,
      );

    // Use subscription's current period start to ensure consistent threshold
    // regardless of when credits are added during the period
    await this.stripeBillingAlertService.createUsageThresholdAlertForCustomerMeter(
      stripeCustomerId,
      workflowItem.tierQuantity,
      creditBalance,
      subscription.currentPeriodStart,
    );
  }
}
