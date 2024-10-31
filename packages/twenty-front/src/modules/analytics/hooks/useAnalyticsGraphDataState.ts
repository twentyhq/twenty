import { webhookAnalyticsGraphDataState } from '@/analytics/states/webhookAnalyticsGraphDataState';

import { mapWebhookAnalyticsResultToNivoLineInput } from '@/analytics/utils/mapWebhookAnalyticsResultToNivoLineInput';

export const useAnalyticsGraphDataState = (endpointName: string) => {
  switch (endpointName) {
    case 'getWebhookAnalytics':
      return {
        analyticsState: webhookAnalyticsGraphDataState,
        transformDataFunction: mapWebhookAnalyticsResultToNivoLineInput,
      };
    default:
      throw new Error(
        `No analytics state associated with endpoint "${endpointName}"`,
      );
  }
};
