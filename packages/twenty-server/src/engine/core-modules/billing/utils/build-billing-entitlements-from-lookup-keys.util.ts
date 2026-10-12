/* @license Enterprise */

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';

// A missing row reads as denied, so every key gets a row or new enum keys stay denied for existing workspaces.
export const buildBillingEntitlementsFromLookupKeys = ({
  workspaceId,
  stripeCustomerId,
  activeLookupKeys,
}: {
  workspaceId: string;
  stripeCustomerId: string;
  activeLookupKeys: string[];
}) =>
  Object.values(BillingEntitlementKey).map((key) => ({
    workspaceId,
    key,
    value: activeLookupKeys.includes(key),
    stripeCustomerId,
  }));
