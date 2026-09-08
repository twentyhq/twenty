/* @license Enterprise */

import type Stripe from 'stripe';

import { buildBillingEntitlementsFromLookupKeys } from 'src/engine/core-modules/billing/utils/build-billing-entitlements-from-lookup-keys.util';

export const transformStripeEntitlementUpdatedEventToDatabaseEntitlement = (
  workspaceId: string,
  data: Stripe.EntitlementsActiveEntitlementSummaryUpdatedEvent.Data,
) =>
  buildBillingEntitlementsFromLookupKeys({
    workspaceId,
    stripeCustomerId: data.object.customer,
    activeLookupKeys: data.object.entitlements.data.map(
      (entitlement) => entitlement.lookup_key,
    ),
  });
