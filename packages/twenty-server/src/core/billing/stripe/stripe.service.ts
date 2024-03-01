import { Injectable, Logger } from '@nestjs/common';

import Stripe from 'stripe';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { User } from 'src/core/user/user.entity';
import { assert } from 'src/utils/assert';

@Injectable()
export class StripeService {
  protected readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe;

  constructor(private readonly environmentService: EnvironmentService) {
    this.stripe = new Stripe(
      this.environmentService.getBillingStripeApiKey(),
      {},
    );
  }

  constructEventFromPayload(signature: string, payload: Buffer) {
    const webhookSecret =
      this.environmentService.getBillingStripeWebhookSecret();

    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }

  async getProductPrices(stripeProductId: string) {
    return this.stripe.prices.search({
      query: `product: '${stripeProductId}'`,
    });
  }

  async updateSubscriptionItem(stripeItemId: string, quantity: number) {
    await this.stripe.subscriptionItems.update(stripeItemId, { quantity });
  }

  async cancelSubscription(stripeSubscriptionId: string) {
    await this.stripe.subscriptions.cancel(stripeSubscriptionId);
  }

  async createCheckoutSession(
    user: User,
    priceId: string,
    successUrl?: string,
    cancelUrl?: string,
  ) {
    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        metadata: {
          workspaceId: user.defaultWorkspace.id,
        },
        trial_period_days:
          this.environmentService.getBillingFreeTrialDurationInDays(),
      },
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      customer_email: user.email,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    assert(session.url, 'Error: missing checkout.session.url');

    this.logger.log(`Stripe Checkout Session Url Redirection: ${session.url}`);

    return session.url;
  }
}
