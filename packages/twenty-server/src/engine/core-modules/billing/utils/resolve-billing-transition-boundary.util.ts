/* @license Enterprise */

// Stripe stamps a subscription_cycle invoice with the period it bills, which is
// the upcoming one for licensed items but the one that just closed for metered
// items. Resource credits are sold as a metered item, so on a subscription
// carrying both the invoice can arrive stamped with either window and its
// period_start is not the handover instant. The subscription is unambiguous
// about where its own periods hand over, so the boundary is read off it: the
// invoice only tells us that a handover happened.
//
// Of the subscription's two boundaries, the one being announced is the later
// one if it has already arrived, and the period start otherwise. Taking the
// nearest instead would let a redelivery hours or days late pick a period end
// still in the future and settle a period that has not closed, on partial
// usage, reserving the idempotency key the real transition then needs.
//
// Both instants compared here are issued by Stripe, so there is no skew between
// them and no tolerance to allow for. Comparing against our own wall clock
// would need one, and any tolerance wide enough to cover skew is also wide
// enough to accept a period end that has not arrived.
export const resolveBillingTransitionBoundary = ({
  invoiceCreatedAt,
  subscriptionCurrentPeriodStart,
  subscriptionCurrentPeriodEnd,
}: {
  invoiceCreatedAt: Date;
  subscriptionCurrentPeriodStart: Date;
  subscriptionCurrentPeriodEnd: Date;
}): Date => {
  if (subscriptionCurrentPeriodEnd.getTime() <= invoiceCreatedAt.getTime()) {
    return subscriptionCurrentPeriodEnd;
  }

  return subscriptionCurrentPeriodStart;
};
