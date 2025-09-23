import { type BarChartConfiguration } from '@/page-layout/widgets/graph/types/BarChartConfiguration';
import { type GaugeChartConfiguration } from '@/page-layout/widgets/graph/types/GaugeChartConfiguration';
import { type LineChartConfiguration } from '@/page-layout/widgets/graph/types/LineChartConfiguration';
import { type NumberChartConfiguration } from '@/page-layout/widgets/graph/types/NumberChartConfiguration';
import { type PieChartConfiguration } from '@/page-layout/widgets/graph/types/PieChartConfiguration';

export type GraphWidgetConfiguration =
  | BarChartConfiguration
  | LineChartConfiguration
  | PieChartConfiguration
  | NumberChartConfiguration
  | GaugeChartConfiguration;
