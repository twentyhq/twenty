/* @license Enterprise */

import type Stripe from 'stripe';

import { transformStripeEntitlementUpdatedEventToDatabaseEntitlement } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-entitlement-updated-event-to-database-entitlement.util';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';

describe('transformStripeEntitlementUpdatedEventToDatabaseEntitlement', () => {
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

    const result = transformStripeEntitlementUpdatedEventToDatabaseEntitlement(
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
      {
        key: BillingEntitlementKey.CUSTOM_DOMAIN,
        stripeCustomerId: 'cus_123',
        value: false,
        workspaceId: 'workspaceId',
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

    const result = transformStripeEntitlementUpdatedEventToDatabaseEntitlement(
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
      {
        key: 'CUSTOM_DOMAIN',
        stripeCustomerId: 'cus_123',
        value: false,
        workspaceId: 'workspaceId',
      },
    ]);
  });
});
