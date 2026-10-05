// Shared by the ClickHouse read and the due check so they cannot drift and re-charge every workspace daily.
export const buildRecurringChargeKey = ({
  applicationId,
  chargeKey,
}: {
  applicationId: string;
  chargeKey: string;
}): string => `${applicationId}:${chargeKey}`;
