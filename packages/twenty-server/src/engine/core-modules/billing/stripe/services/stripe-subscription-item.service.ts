import { Injectable, Logger } from '@nestjs/common';

import Stripe from 'stripe';

import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class StripeSubscriptionItemService {
  protected readonly logger = new Logger(StripeSubscriptionItemService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly stripeSDKService: StripeSDKService,
  ) {
    if (!this.environmentService.get('IS_BILLING_ENABLED')) {
      return;
    }
    this.stripe = this.stripeSDKService.getStripe(
      this.environmentService.get('BILLING_STRIPE_API_KEY'),
    );
  }

  async updateSubscriptionItem(stripeItemId: string, quantity: number) {
    await this.stripe.subscriptionItems.update(stripeItemId, { quantity });
  }

  async updateBillingSubscriptionItem(
    stripeSubscriptionItem: BillingSubscriptionItem,
    stripePriceId: string,
  ) {
    await this.stripe.subscriptionItems.update(
      stripeSubscriptionItem.stripeSubscriptionItemId,
      {
        price: stripePriceId,
        quantity:
          stripeSubscriptionItem.quantity === null
            ? undefined
            : stripeSubscriptionItem.quantity,
      },
    );
  }
}
