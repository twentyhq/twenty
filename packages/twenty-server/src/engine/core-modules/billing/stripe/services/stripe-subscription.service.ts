/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import Stripe from 'stripe';

import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class StripeSubscriptionService {
  protected readonly logger = new Logger(StripeSubscriptionService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly stripeSDKService: StripeSDKService,
  ) {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return;
    }
    this.stripe = this.stripeSDKService.getStripe(
      this.twentyConfigService.get('BILLING_STRIPE_API_KEY'),
    );
  }

  async cancelSubscription(stripeSubscriptionId: string) {
    await this.stripe.subscriptions.cancel(stripeSubscriptionId);
  }

  async getStripeCustomerIdFromWorkspaceId(workspaceId: string) {
    const subscription = await this.stripe.subscriptions.search({
      query: `metadata['workspaceId']:'${workspaceId}'`,
      limit: 1,
    });
    const stripeCustomerId = subscription.data[0].customer
      ? String(subscription.data[0].customer)
      : undefined;

    return stripeCustomerId;
  }

  async collectLastInvoice(stripeSubscriptionId: string) {
    const subscription = await this.stripe.subscriptions.retrieve(
      stripeSubscriptionId,
      { expand: ['latest_invoice'] },
    );
    const latestInvoice = subscription.latest_invoice;

    if (
      !(
        latestInvoice &&
        typeof latestInvoice !== 'string' &&
        latestInvoice.status === 'draft'
      )
    ) {
      return;
    }
    await this.stripe.invoices.pay(latestInvoice.id);
  }

  async updateSubscriptionItems(
    stripeSubscriptionId: string,
    billingSubscriptionItems: BillingSubscriptionItem[],
  ) {
    const stripeSubscriptionItemsToUpdate = billingSubscriptionItems.map(
      (item) => ({
        id: item.stripeSubscriptionItemId,
        price: item.stripePriceId,
        quantity: item.quantity === null ? undefined : item.quantity,
      }),
    );

    await this.stripe.subscriptions.update(stripeSubscriptionId, {
      items: stripeSubscriptionItemsToUpdate,
    });
  }

  async updateSubscription(
    stripeSubscriptionId: string,
    updateData: Stripe.SubscriptionUpdateParams,
  ): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.update(stripeSubscriptionId, updateData);
  }
}
