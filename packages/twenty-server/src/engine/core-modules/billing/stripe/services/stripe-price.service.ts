/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import type Stripe from 'stripe';

import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class StripePriceService {
  protected readonly logger = new Logger(StripePriceService.name);
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

  async getPriceByPriceId(priceId: string) {
    return await this.stripe.prices.retrieve(priceId, {
      expand: ['data.currency_options', 'data.tiers'],
    });
  }

  async getPricesByProductId(productId: string) {
    const prices = await this.stripe.prices.list({
      product: productId,
      type: 'recurring',
      limit: 100,
      expand: ['data.currency_options', 'data.tiers'],
    });

    return prices.data;
  }
}
