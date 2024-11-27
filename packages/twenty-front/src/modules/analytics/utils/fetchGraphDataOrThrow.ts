import { ANALYTICS_ENDPOINT_TYPE_MAP } from '@/analytics/constants/AnalyticsEndpointTypeMap';
import { ANALYTICS_GRAPH_OPTION_MAP } from '@/analytics/constants/AnalyticsGraphOptionMap';
import { AnalyticsComponentProps } from '@/analytics/types/AnalyticsComponentProps';
import { computeStartEndDate } from '@/analytics/utils/computeStartEndDate';

type fetchGraphDataOrThrowProps = AnalyticsComponentProps & {
  windowLength: '7D' | '1D' | '12H' | '4H';
  tinybirdJwt: string;
};

export const fetchGraphDataOrThrow = async ({
  recordId,
  windowLength,
  tinybirdJwt,
  endpointName,
}: fetchGraphDataOrThrowProps) => {
  const recordType = ANALYTICS_ENDPOINT_TYPE_MAP[endpointName];
  const queryString = new URLSearchParams({
    ...ANALYTICS_GRAPH_OPTION_MAP[windowLength],
    ...computeStartEndDate(windowLength),
    ...{ [`${recordType}Id`]: recordId },
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
