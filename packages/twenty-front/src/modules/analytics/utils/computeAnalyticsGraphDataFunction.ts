import { mapServerlessFunctionDurationToNivoLineInput } from '@/analytics/utils/mapServerlessFunctionDurationToNivoLineInput';
import { mapServerlessFunctionErrorsToNivoLineInput } from '@/analytics/utils/mapServerlessFunctionErrorsToNivoLineInput';
import { mapWebhookAnalyticsResultToNivoLineInput } from '@/analytics/utils/mapWebhookAnalyticsResultToNivoLineInput';
import { AnalyticsTinybirdJwtMap } from '~/generated-metadata/graphql';

export const computeAnalyticsGraphDataFunction = (
  endpointName: keyof AnalyticsTinybirdJwtMap,
) => {
  switch (endpointName) {
    case 'getWebhookAnalytics':
      return mapWebhookAnalyticsResultToNivoLineInput;
    case 'getServerlessFunctionDuration':
      return mapServerlessFunctionDurationToNivoLineInput;
    case 'getServerlessFunctionErrorCount':
      return (data: { start: string; error_count: number }[]) =>
        mapServerlessFunctionErrorsToNivoLineInput(data, 'ErrorCount');
    case 'getServerlessFunctionSuccessRate':
      return (data: { start: string; success_rate: number }[]) =>
        mapServerlessFunctionErrorsToNivoLineInput(data, 'SuccessRate');
    default:
      throw new Error(
        `No analytics function found associated with endpoint "${endpointName}"`,
      );
  }
};
