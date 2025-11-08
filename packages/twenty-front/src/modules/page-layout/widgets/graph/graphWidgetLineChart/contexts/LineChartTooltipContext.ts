import { type GraphWidgetTooltipItem } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { type VirtualElement } from '@floating-ui/react';
import { createRequiredContext } from '~/utils/createRequiredContext';

export type LineChartTooltipContextType = {
  showTooltip: (
    virtualElement: VirtualElement,
    items: GraphWidgetTooltipItem[],
    indexLabel: string | undefined,
    highlightedSeriesId: string,
    scrollable: boolean,
    crosshairX: number,
  ) => void;
  hideTooltip: () => void;
  crosshairX: number | null;
};

export const [LineChartTooltipProvider, useLineChartTooltipContext] =
  createRequiredContext<LineChartTooltipContextType>('LineChartTooltip');
