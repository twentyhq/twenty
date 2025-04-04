import { AnalyticsService } from 'src/engine/core-modules/analytics/services/analytics.service';

export type AnalyticsEventName = 'event' | 'pageview';

export type AnalyticsContext = ReturnType<
  AnalyticsService['createAnalyticsContext']
>;
