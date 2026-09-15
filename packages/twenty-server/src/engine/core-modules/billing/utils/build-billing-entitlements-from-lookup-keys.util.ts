/* @license Enterprise */

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';

// A row is written for every key, not only the granted ones: a key absent from
// the table reads as denied, so a key added to the enum stays denied for every
// existing workspace until something writes its row.
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
