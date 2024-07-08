import { AnalyticsQueryFilter } from '@/activities/reports/types/AnalyticsQueryFilter';
import { Chart } from '@/activities/reports/types/Chart';

export interface AnalyticsQuery {
  id: string;
  chart: Chart;
  chartId: string;
  measure: AnalyticsQueryMeasure;
  sourceObjectNameSingular: string;
  fieldPath: string;
  analyticsQueryFilters: AnalyticsQueryFilter[];
  groupBy: string;
  analyticsQueryResult: any; // TODO
  analyticsQueryResultCreatedAt: string;
  __typename: string;
}

export type AnalyticsQueryMeasure = 'average' | 'sum' | 'min' | 'max' | 'count';
