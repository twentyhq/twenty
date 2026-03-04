import { type TypedAggregateChartConfiguration } from '@/command-menu/pages/page-layout/types/TypedAggregateChartConfiguration';
import { type TypedBarChartConfiguration } from '@/command-menu/pages/page-layout/types/TypedBarChartConfiguration';
import { type TypedGaugeChartConfiguration } from '@/command-menu/pages/page-layout/types/TypedGaugeChartConfiguration';
import { type TypedLineChartConfiguration } from '@/command-menu/pages/page-layout/types/TypedLineChartConfiguration';
import { type TypedPieChartConfiguration } from '@/command-menu/pages/page-layout/types/TypedPieChartConfiguration';

export type ChartWidgetConfiguration =
  | TypedBarChartConfiguration
  | TypedGaugeChartConfiguration
  | TypedLineChartConfiguration
  | TypedAggregateChartConfiguration
  | TypedPieChartConfiguration;
