import { type BarChartTooltipElementAnchor } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartTooltipElementAnchor';
import { type LineChartTooltipPointAnchor } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartTooltipPointAnchor';

export type ChartTooltipAnchorSource =
  | BarChartTooltipElementAnchor
  | LineChartTooltipPointAnchor;
