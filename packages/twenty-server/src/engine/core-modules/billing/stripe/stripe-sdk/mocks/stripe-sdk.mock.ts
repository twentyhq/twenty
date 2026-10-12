/* @license Enterprise */

import { randomUUID } from 'node:crypto';

import type Stripe from 'stripe';

export class StripeSDKMock {
  constructor(private readonly _apiKey: string) {}

  customers = {
    update: (_id: string, _params?: Stripe.CustomerUpdateParams) => {
      return;
    },
  };

  invoiceItems = {
    create: (
      params: Stripe.InvoiceItemCreateParams,
      options?: Stripe.RequestOptions,
    ) => ({
      id: `ii_${options?.idempotencyKey ?? randomUUID()}`,
      object: 'invoiceitem',
      ...params,
    }),
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
