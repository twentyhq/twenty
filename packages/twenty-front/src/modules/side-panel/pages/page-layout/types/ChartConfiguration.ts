import { type TypedGaugeChartConfiguration } from '@/command-menu/pages/page-layout/types/TypedGaugeChartConfiguration';
import { type TypedAggregateChartConfiguration } from './TypedAggregateChartConfiguration';
import { type TypedBarChartConfiguration } from './TypedBarChartConfiguration';
import { type TypedLineChartConfiguration } from './TypedLineChartConfiguration';
import { type TypedPieChartConfiguration } from './TypedPieChartConfiguration';

export type ChartConfiguration =
  | TypedBarChartConfiguration
  | TypedLineChartConfiguration
  | TypedPieChartConfiguration
  | TypedAggregateChartConfiguration
  | TypedGaugeChartConfiguration;
