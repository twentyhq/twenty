/* @license Enterprise */

import type Stripe from 'stripe';

export class StripeSDKMock {
  constructor(private readonly _apiKey: string) {}

  customers = {
    create: (params?: Stripe.CustomerCreateParams) => {
      return {
        id: `cus_mock_${crypto.randomUUID()}`,
        ...params,
      };
    },
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
