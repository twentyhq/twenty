import { type ChartTooltipAnchorSource } from '@/page-layout/widgets/graph/types/ChartTooltipAnchorSource';
import { type GraphWidgetTooltipContent } from '@/page-layout/widgets/graph/types/GraphWidgetTooltipContent';

export type GraphWidgetTooltipData = GraphWidgetTooltipContent & {
  anchor: ChartTooltipAnchorSource;
};
