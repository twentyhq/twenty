import Stripe from 'stripe';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';

export const transformStripeEntitlementUpdatedEventToEntitlementRepositoryData =
  (
    workspaceId: string,
    data: Stripe.EntitlementsActiveEntitlementSummaryUpdatedEvent.Data,
  ) => {
    const stripeCustomerId = data.object.customer;
    const activeEntitlementsKeys = data.object.entitlements.data.map(
      (entitlement) => entitlement.lookup_key,
    );

    return Object.values(BillingEntitlementKey).map((key) => {
      return {
        workspaceId,
        key,
        value: activeEntitlementsKeys.includes(key),
        stripeCustomerId,
      };
    });
  };
