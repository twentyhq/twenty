/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import { type BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';

const hasEntitlementKey = (
  entitlements: { lookup_key: string }[] | undefined,
  key: BillingEntitlementKey,
): boolean =>
  isDefined(entitlements) &&
  entitlements.some((entitlement) => entitlement.lookup_key === key);

export const isEntitlementGrantedByStripeEvent = ({
  data,
  key,
}: {
  data: Stripe.EntitlementsActiveEntitlementSummaryUpdatedEvent.Data;
  key: BillingEntitlementKey;
}): boolean => {
  const previousEntitlements = data.previous_attributes?.entitlements?.data;

  if (!isDefined(previousEntitlements)) {
    return false;
  }

  return (
    !hasEntitlementKey(previousEntitlements, key) &&
    hasEntitlementKey(data.object.entitlements.data, key)
  );
};
