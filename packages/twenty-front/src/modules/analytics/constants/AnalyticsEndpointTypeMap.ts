import { AnalyticsTinybirdJwtMap } from '~/generated-metadata/graphql';

export const ANALYTICS_ENDPOINT_TYPE_MAP: AnalyticsTinybirdJwtMap = {
  getWebhookAnalytics: 'webhook',
  getPageviewsAnalytics: 'pageviews',
  getUsersAnalytics: 'users',
  getServerlessFunctionDuration: 'function',
  getServerlessFunctionSuccessRate: 'function',
  getServerlessFunctionErrorCount: 'function',
};
