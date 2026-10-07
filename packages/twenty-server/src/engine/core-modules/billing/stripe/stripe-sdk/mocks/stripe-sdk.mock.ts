/* @license Enterprise */

import type Stripe from 'stripe';

import { STRIPE_SDK_MOCK_ACTIVE_ENTITLEMENT_LOOKUP_KEYS } from 'src/engine/core-modules/billing/stripe/stripe-sdk/mocks/stripe-sdk-mock-active-entitlement-lookup-keys.constant';

export class StripeSDKMock {
  constructor(private readonly _apiKey: string) {}

  customers = {
    update: (_id: string, _params?: Stripe.CustomerUpdateParams) => {
      return;
    },
  };

  entitlements = {
    activeEntitlements: {
      list: async function* (
        _params: Stripe.Entitlements.ActiveEntitlementListParams,
      ): AsyncGenerator<Stripe.Entitlements.ActiveEntitlement> {
        for (const [
          index,
          lookupKey,
        ] of STRIPE_SDK_MOCK_ACTIVE_ENTITLEMENT_LOOKUP_KEYS.entries()) {
          yield {
            id: `ent_mock_${index}`,
            object: 'entitlements.active_entitlement',
            feature: `feat_mock_${index}`,
            livemode: false,
            lookup_key: lookupKey,
          };
        }
      },
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
