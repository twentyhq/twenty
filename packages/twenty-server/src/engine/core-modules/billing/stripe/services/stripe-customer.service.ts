/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import Stripe from 'stripe';

import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class StripeCustomerService {
  protected readonly logger = new Logger(StripeCustomerService.name);
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

  async updateCustomerMetadataWorkspaceId(
    stripeCustomerId: string,
    workspaceId: string,
  ) {
    await this.stripe.customers.update(stripeCustomerId, {
      metadata: { workspaceId: workspaceId },
    });
  }

  async hasPaymentMethod(stripeCustomerId: string) {
    const { data: paymentMethods } =
      await this.stripe.customers.listPaymentMethods(stripeCustomerId);

    return paymentMethods.length > 0;
  }
}
