/* @license Enterprise */

// The invoice is raised at the handover, so its period_end can be either side
// of it depending on clock skew between Stripe and us.
const BOUNDARY_ARRIVAL_TOLERANCE_IN_MS = 60 * 60 * 1000;

// Stripe stamps a subscription_cycle invoice with the period it bills, which is
// the upcoming one for licensed items but the one that just closed for metered
// items. Resource credits are sold as a metered item, so on a subscription
// carrying both the invoice can arrive stamped with either window and its
// period_start is not the handover instant. The subscription is unambiguous
// about where its own periods hand over, so the boundary is read off it: the
// invoice only tells us that a handover happened.
//
// Of the subscription's two boundaries, the one being announced is the latest
// that has actually arrived. Taking the nearest instead would let a redelivery
// hours or days late pick the period end still in the future and settle a
// period that has not closed, on partial usage, and reserve the idempotency
// key that the real transition then needs.
export const resolveBillingTransitionBoundary = ({
  observedAt,
  subscriptionCurrentPeriodStart,
  subscriptionCurrentPeriodEnd,
}: {
  observedAt: Date;
  subscriptionCurrentPeriodStart: Date;
  subscriptionCurrentPeriodEnd: Date;
}): Date => {
  const arrivedBy = observedAt.getTime() + BOUNDARY_ARRIVAL_TOLERANCE_IN_MS;

  if (subscriptionCurrentPeriodEnd.getTime() <= arrivedBy) {
    return subscriptionCurrentPeriodEnd;
  }

  return subscriptionCurrentPeriodStart;
};
