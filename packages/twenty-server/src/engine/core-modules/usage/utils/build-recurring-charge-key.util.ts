// Identifies one recurring charge within a billing period, as the usage row
// that records it: the application and the charge name it was raised under.
// Both the ClickHouse read of what a period already carries and the check for
// what is still due go through this, so the two cannot drift apart and start
// re-charging every workspace daily.
export const buildRecurringChargeKey = ({
  applicationId,
  chargeKey,
}: {
  applicationId: string;
  chargeKey: string;
}): string => `${applicationId}:${chargeKey}`;
