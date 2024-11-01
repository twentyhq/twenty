import { ANALYTICS_GRAPH_OPTION_MAP } from '@/analytics/constants/AnalyticsGraphOptionMap';
import { computeStartEndDate } from '@/analytics/utils/computeStartEndDate';
type fetchGraphDataOrThrowProps = {
  recordId: string;
  recordType: string;
  windowLength: '7D' | '1D' | '12H' | '4H';
  tinybirdJwt: string;
  endpointName: string;
};

export const fetchGraphDataOrThrow = async ({
  recordId,
  recordType,
  windowLength,
  tinybirdJwt,
  endpointName,
}: fetchGraphDataOrThrowProps) => {
  const queryString = new URLSearchParams({
    ...ANALYTICS_GRAPH_OPTION_MAP[windowLength],
    ...computeStartEndDate(windowLength),
    ...(recordType === 'webhook'
      ? { webhookId: recordId }
      : { functionId: recordId }), //later create a switch case
  }).toString();

  const response = await fetch(
    `https://api.eu-central-1.aws.tinybird.co/v0/pipes/${endpointName}.json?${queryString}`,
    {
      headers: {
        Authorization: 'Bearer ' + tinybirdJwt,
      },
    },
  );
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error);
  }
  return result.data;
};
