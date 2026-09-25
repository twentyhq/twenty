/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { PAYMENT_METHOD_DOMAIN_STRIPE_REQUEST_OPTIONS } from 'src/engine/core-modules/billing/constants/payment-method-domain-stripe-request-options.constant';
import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class StripePaymentMethodDomainService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly stripeSDKService: StripeSDKService,
  ) {}

  // Billing can be toggled at runtime, so the Stripe client is built per call
  // rather than once when the worker starts. A domain that already exists is
  // left as is, so one disabled from the Stripe dashboard stays disabled.
  async registerDomain(domainName: string): Promise<void> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return;
    }

    const stripe = this.stripeSDKService.getStripe(
      this.twentyConfigService.get('BILLING_STRIPE_API_KEY'),
    );

    const {
      data: [existingPaymentMethodDomain],
    } = await stripe.paymentMethodDomains.list(
      { domain_name: domainName, limit: 1 },
      PAYMENT_METHOD_DOMAIN_STRIPE_REQUEST_OPTIONS,
    );

    if (isDefined(existingPaymentMethodDomain)) {
      return;
    }

    await stripe.paymentMethodDomains.create(
      { domain_name: domainName },
      PAYMENT_METHOD_DOMAIN_STRIPE_REQUEST_OPTIONS,
    );
  }
}
