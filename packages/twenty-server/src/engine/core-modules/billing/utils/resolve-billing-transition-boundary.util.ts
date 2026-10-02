/* @license Enterprise */

// Invoice period stamps are ambiguous (metered items bill in arrears), so use the subscription boundary nearest invoice.created.
// Only valid for subscription_cycle invoices, which Stripe raises at the handover.
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
