/* @license Enterprise */

export const getRenewalDate = ({
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
