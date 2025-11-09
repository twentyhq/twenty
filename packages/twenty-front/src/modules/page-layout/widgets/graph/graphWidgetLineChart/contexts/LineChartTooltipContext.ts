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
    linkTo?: string,
    chartContainerId?: string,
  ) => void;
  hideTooltip: () => void;
  crosshairX: number | null;
  hideTooltipIfOutside: (relatedTarget: EventTarget | null) => void;
  isEventInsideTooltip: (target: EventTarget | null) => boolean;
};

export const [
  LineChartTooltipContextProvider,
  useLineChartTooltipContextOrThrow,
] = createRequiredContext<LineChartTooltipContextType>(
  'LineChartTooltipContext',
);
