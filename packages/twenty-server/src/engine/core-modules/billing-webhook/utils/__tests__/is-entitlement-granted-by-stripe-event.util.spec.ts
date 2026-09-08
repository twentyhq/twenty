/* @license Enterprise */

import type Stripe from 'stripe';

import { isEntitlementGrantedByStripeEvent } from 'src/engine/core-modules/billing-webhook/utils/is-entitlement-granted-by-stripe-event.util';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';

const buildEntitlement = (
  lookupKey: string,
): Stripe.Entitlements.ActiveEntitlement => ({
  id: `ent_${lookupKey}`,
  object: 'entitlements.active_entitlement',
  feature: `feat_${lookupKey}`,
  livemode: false,
  lookup_key: lookupKey,
});

const buildData = ({
  current,
  previous,
}: {
  current: string[];
  previous?: string[];
}): Stripe.EntitlementsActiveEntitlementSummaryUpdatedEvent.Data => ({
  object: {
    object: 'entitlements.active_entitlement_summary',
    customer: 'cus_123',
    livemode: false,
    entitlements: {
      object: 'list',
      data: current.map(buildEntitlement),
      has_more: false,
      url: '',
    },
  },
  ...(previous
    ? {
        previous_attributes: {
          entitlements: {
            data: previous.map(buildEntitlement),
          } as Stripe.ApiList<Stripe.Entitlements.ActiveEntitlement>,
        },
      }
    : {}),
});

describe('isEntitlementGrantedByStripeEvent', () => {
  it('is true when the key appears in the current list only', () => {
    expect(
      isEntitlementGrantedByStripeEvent({
        data: buildData({ current: ['USAGE_LIMIT', 'SSO'], previous: ['SSO'] }),
        key: BillingEntitlementKey.USAGE_LIMIT,
      }),
    ).toBe(true);
  });

  it('is false when the key was already granted', () => {
    expect(
      isEntitlementGrantedByStripeEvent({
        data: buildData({
          current: ['USAGE_LIMIT', 'SSO'],
          previous: ['USAGE_LIMIT'],
        }),
        key: BillingEntitlementKey.USAGE_LIMIT,
      }),
    ).toBe(false);
  });

  it('is false when the key is revoked', () => {
    expect(
      isEntitlementGrantedByStripeEvent({
        data: buildData({ current: [], previous: ['USAGE_LIMIT'] }),
        key: BillingEntitlementKey.USAGE_LIMIT,
      }),
    ).toBe(false);
  });

  it('is false when the event carries no previous entitlements', () => {
    expect(
      isEntitlementGrantedByStripeEvent({
        data: buildData({ current: ['USAGE_LIMIT'] }),
        key: BillingEntitlementKey.USAGE_LIMIT,
      }),
    ).toBe(false);
  });
});
