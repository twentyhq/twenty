/* @license Enterprise */

// Stripe stamps a subscription_cycle invoice with the period it bills, which is
// the upcoming one for licensed items but the one that just closed for metered
// items. Resource credits are sold as a metered item, so on a subscription
// carrying both the invoice can arrive stamped with either window and its
// period_start is not the handover instant. The subscription is unambiguous
// about where its own periods hand over, so the boundary is read off it: the
// invoice only tells us that a handover happened.
//
// Which of the subscription's two boundaries is the handover depends on whether
// our copy of it has advanced yet, and Stripe raises the invoice at the
// handover itself. So the answer is whichever boundary the invoice was created
// nearest to: it is the period end while the subscription still holds the
// closing window, and the period start once it has moved on.
//
// The two candidates are a whole period apart and the invoice sits on the
// handover, so this resolves with half a period of room on either side. That is
// what makes it safe where comparing against our own wall clock was not: a
// redelivery processed days late used to drag the observation point with it,
// where invoice.created stays pinned to the handover however late we get to it.
// It also cannot drift toward a period end that has not arrived, because the
// nearer boundary to the handover is the handover.
//
// That last part rests on the caller passing only subscription_cycle invoices,
// which Stripe raises at the handover. Given any other invoice, raised at an
// arbitrary point inside the period, nearness would answer with whichever
// boundary happened to be closer and could name a period end still to come.
// Widening what reaches this, or dropping that filter, breaks the guarantee.
export const resolveBillingTransitionBoundary = ({
  invoiceCreatedAt,
  subscriptionCurrentPeriodStart,
  subscriptionCurrentPeriodEnd,
}: {
  invoiceCreatedAt: Date;
  subscriptionCurrentPeriodStart: Date;
  subscriptionCurrentPeriodEnd: Date;
}): Date => {
  const createdAt = invoiceCreatedAt.getTime();

  const distanceToPeriodStart = Math.abs(
    subscriptionCurrentPeriodStart.getTime() - createdAt,
  );
  const distanceToPeriodEnd = Math.abs(
    subscriptionCurrentPeriodEnd.getTime() - createdAt,
  );

  return distanceToPeriodEnd < distanceToPeriodStart
    ? subscriptionCurrentPeriodEnd
    : subscriptionCurrentPeriodStart;
};
