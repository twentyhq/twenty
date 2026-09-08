/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import type Stripe from 'stripe';

import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class StripeEntitlementService {
  protected readonly logger = new Logger(StripeEntitlementService.name);
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

  async getActiveEntitlementLookupKeys(
    stripeCustomerId: string,
  ): Promise<string[]> {
    const lookupKeys: string[] = [];

    for await (const activeEntitlement of this.stripe.entitlements.activeEntitlements.list(
      { customer: stripeCustomerId, limit: 100 },
    )) {
      lookupKeys.push(activeEntitlement.lookup_key);
    }

    return lookupKeys;
  }
}
