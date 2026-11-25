/* @license Enterprise */

import type Stripe from 'stripe';

import { STRIPE_SDK_MOCK_CUSTOMER_EMAIL } from 'src/engine/core-modules/billing/stripe/stripe-sdk/mocks/stripe-sdk-mock-customer-email.constant';

export class StripeSDKMock {
  constructor(private readonly _apiKey: string) {}

  customers = {
    retrieve: async (id: string) => ({
      id,
      object: 'customer',
      email: STRIPE_SDK_MOCK_CUSTOMER_EMAIL,
      metadata: {},
    }),
    update: (_id: string, _params?: Stripe.CustomerUpdateParams) => {
      return;
    },
  };

  webhooks = {
    constructEvent: (
      payload: Buffer,
      signature: string,
      _webhookSecret: string,
    ) => {
      if (signature === 'correct-signature') {
        const body = JSON.parse(payload.toString());

        return {
          type: body.type,
          data: body.data,
        };
      }
      throw new Error('Invalid signature');
    },
  };
}
