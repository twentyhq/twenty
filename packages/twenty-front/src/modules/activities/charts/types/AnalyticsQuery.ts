import { Chart } from '@/activities/charts/types/Chart';

export interface AnalyticsQuery {
  id: string;
  chart: Chart;
  chartId: string;
}
