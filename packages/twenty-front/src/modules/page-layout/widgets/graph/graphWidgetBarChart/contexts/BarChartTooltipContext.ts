import { type GraphWidgetTooltipItem } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { createRequiredContext } from '~/utils/createRequiredContext';

export type BarChartTooltipContextType = {
  showTooltip: (
    anchorElement: Element,
    items: GraphWidgetTooltipItem[],
    indexLabel: string,
    showClickHint: boolean,
    highlightedKey?: string,
    linkTo?: string,
    chartContainerId?: string,
  ) => void;
  hideTooltip: () => void;
  hideTooltipIfOutside: (relatedTarget: EventTarget | null) => void;
  isEventInsideTooltip: (target: EventTarget | null) => boolean;
};

export const [
  BarChartTooltipContextProvider,
  useBarChartTooltipContextOrThrow,
] = createRequiredContext<BarChartTooltipContextType>('BarChartTooltipContext');
