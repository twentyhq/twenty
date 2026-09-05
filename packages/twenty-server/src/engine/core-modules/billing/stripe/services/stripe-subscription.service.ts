/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import type Stripe from 'stripe';

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

    return subscription.data[0]?.customer ?? undefined;
  }

  async payOpenInvoices(
    stripeSubscriptionId: string,
    stripePaymentMethodId: string,
  ) {
    const openInvoices = await this.stripe.invoices.list({
      subscription: stripeSubscriptionId,
      status: 'open',
      collection_method: 'charge_automatically',
    });

    // Stripe lists the most recent invoices first, settle the oldest overdue period first
    for (const invoice of [...openInvoices.data].reverse()) {
      try {
        await this.stripe.invoices.pay(invoice.id, {
          payment_method: stripePaymentMethodId,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'unknown error';

        this.logger.error(
          `Failed to pay invoice ${invoice.id} of subscription ${stripeSubscriptionId}: ${errorMessage}`,
        );
      }
    }
  }

  async updateSubscription(
    stripeSubscriptionId: string,
    updateData: Stripe.SubscriptionUpdateParams,
  ): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.update(stripeSubscriptionId, updateData);
  }

  getBillingThresholds(meterPriceFlatAmount: number) {
    return {
      amount_gte: Math.max(meterPriceFlatAmount * 2, 10000),
      reset_billing_cycle_anchor: false,
    };
  }
}
