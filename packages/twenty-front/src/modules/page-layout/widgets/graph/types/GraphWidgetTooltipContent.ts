import { type GraphWidgetTooltipItem } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';

export type GraphWidgetTooltipContent = {
  items: GraphWidgetTooltipItem[];
  indexLabel?: string;
  highlightedKey?: string;
};
