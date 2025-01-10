import Stripe from 'stripe';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { transformStripeEntitlementUpdatedEventToEntitlementRepositoryData } from 'src/engine/core-modules/billing/utils/transform-stripe-entitlement-updated-event-to-entitlement-repository-data.util';

describe('transformStripeEntitlementUpdatedEventToEntitlementRepositoryData', () => {
  it('should return the SSO key with true value', () => {
    const data: Stripe.EntitlementsActiveEntitlementSummaryUpdatedEvent.Data = {
      object: {
        customer: 'cus_123',
        entitlements: {
          data: [
            {
              lookup_key: 'SSO',
              feature: 'SSO',
              livemode: false,
              id: 'ent_123',
              object: 'entitlements.active_entitlement',
            },
          ],
          object: 'list',
          has_more: false,
          url: '',
        },
        livemode: false,
        object: 'entitlements.active_entitlement_summary',
      },
    };

    const result =
      transformStripeEntitlementUpdatedEventToEntitlementRepositoryData(
        'workspaceId',
        data,
      );

    expect(result).toEqual([
      {
        workspaceId: 'workspaceId',
        key: BillingEntitlementKey.SSO,
        value: true,
        stripeCustomerId: 'cus_123',
      },
    ]);
  });

  it('should return the SSO key with false value,should only render the values that are listed in BillingEntitlementKeys', () => {
    const data: Stripe.EntitlementsActiveEntitlementSummaryUpdatedEvent.Data = {
      object: {
        customer: 'cus_123',
        entitlements: {
          data: [
            {
              id: 'ent_123',
              object: 'entitlements.active_entitlement',
              lookup_key: 'DIFFERENT_KEY',
              feature: 'DIFFERENT_FEATURE',
              livemode: false,
            },
          ],
          object: 'list',
          has_more: false,
          url: '',
        },
        livemode: false,
        object: 'entitlements.active_entitlement_summary',
      },
    };

    const result =
      transformStripeEntitlementUpdatedEventToEntitlementRepositoryData(
        'workspaceId',
        data,
      );

    expect(result).toEqual([
      {
        workspaceId: 'workspaceId',
        key: BillingEntitlementKey.SSO,
        value: false,
        stripeCustomerId: 'cus_123',
      },
    ]);
  });
});
