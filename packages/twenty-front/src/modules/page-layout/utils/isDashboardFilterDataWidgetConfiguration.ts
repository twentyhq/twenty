import { type DashboardFilterWidgetConfiguration } from '@/page-layout/types/DashboardFilterWidgetConfiguration';

export const isDashboardFilterDataWidgetConfiguration = ({
  __typename,
}: Pick<DashboardFilterWidgetConfiguration, '__typename'>): boolean =>
  __typename === 'AggregateChartConfiguration' ||
  __typename === 'BarChartConfiguration' ||
  __typename === 'LineChartConfiguration' ||
  __typename === 'PieChartConfiguration' ||
  __typename === 'RecordTableConfiguration';
