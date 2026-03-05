import { type TypedAggregateChartConfiguration } from '@/side-panel/pages/page-layout/types/TypedAggregateChartConfiguration';
import { type TypedBarChartConfiguration } from '@/side-panel/pages/page-layout/types/TypedBarChartConfiguration';
import { type TypedGaugeChartConfiguration } from '@/side-panel/pages/page-layout/types/TypedGaugeChartConfiguration';
import { type TypedLineChartConfiguration } from '@/side-panel/pages/page-layout/types/TypedLineChartConfiguration';
import { type TypedPieChartConfiguration } from '@/side-panel/pages/page-layout/types/TypedPieChartConfiguration';

export type ChartWidgetConfiguration =
  | TypedBarChartConfiguration
  | TypedGaugeChartConfiguration
  | TypedLineChartConfiguration
  | TypedAggregateChartConfiguration
  | TypedPieChartConfiguration;
