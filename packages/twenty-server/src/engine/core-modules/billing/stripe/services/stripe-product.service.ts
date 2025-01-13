import { Injectable, Logger } from '@nestjs/common';

import Stripe from 'stripe';

import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class StripeProductService {
  protected readonly logger = new Logger(StripeProductService.name);
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

  async getAllProducts() {
    const products = await this.stripe.products.list();

    return products.data;
  }
}
