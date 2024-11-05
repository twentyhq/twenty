import { mapWebhookAnalyticsResultToNivoLineInput } from '@/analytics/utils/mapWebhookAnalyticsResultToNivoLineInput';
import { AnalyticsTinybirdJwtMap } from '~/generated-metadata/graphql';

export const computeAnalyticsGraphDataFunction = (
  endpointName: keyof AnalyticsTinybirdJwtMap,
) => {
  switch (endpointName) {
    case 'getWebhookAnalytics':
      return mapWebhookAnalyticsResultToNivoLineInput;
    default:
      throw new Error(
        `No analytics function found associated with endpoint "${endpointName}"`,
      );
  }
};
