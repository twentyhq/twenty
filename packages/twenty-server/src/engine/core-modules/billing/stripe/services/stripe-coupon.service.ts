/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import type Stripe from 'stripe';

import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class StripeCouponService {
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

  async listCoupons(): Promise<Stripe.Coupon[]> {
    return await this.stripe.coupons
      .list({ limit: 100, expand: ['data.applies_to'] })
      .autoPagingToArray({ limit: 1000 });
  }

  async getCoupon(stripeCouponId: string): Promise<Stripe.Coupon> {
    return await this.stripe.coupons.retrieve(stripeCouponId, {
      expand: ['applies_to'],
    });
  }
}
