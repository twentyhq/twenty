import { type GraphWidgetTooltipItem } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { createRequiredContext } from '~/utils/createRequiredContext';

export type BarChartTooltipContextType = {
  showTooltip: (
    anchorElement: Element,
    items: GraphWidgetTooltipItem[],
    indexLabel: string,
    showClickHint: boolean,
    highlightedKey?: string,
  ) => void;
  hideTooltip: () => void;
};

export const [BarChartTooltipProvider, useBarChartTooltipContext] =
  createRequiredContext<BarChartTooltipContextType>('BarChartTooltip');
