/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import type Stripe from 'stripe';

import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class StripePaymentMethodDomainService {
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

  // A domain that already exists is left as is, so one disabled from the
  // Stripe dashboard stays disabled.
  async registerDomain(domainName: string): Promise<void> {
    // A job queued before billing was turned off still reaches this worker
    if (!isDefined(this.stripe)) {
      return;
    }

    const {
      data: [existingPaymentMethodDomain],
    } = await this.stripe.paymentMethodDomains.list({
      domain_name: domainName,
      limit: 1,
    });

    if (isDefined(existingPaymentMethodDomain)) {
      return;
    }

    await this.stripe.paymentMethodDomains.create({ domain_name: domainName });
  }
}
