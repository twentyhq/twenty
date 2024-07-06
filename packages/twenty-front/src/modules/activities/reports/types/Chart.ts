import { AnalyticsQuery } from '@/activities/reports/types/AnalyticsQuery';

export interface Chart {
  id: string;
  title: string;
  description: string;
  report: Report;
  reportId: string;
  analyticsQueries: AnalyticsQuery[];
  __typename: string;
}
