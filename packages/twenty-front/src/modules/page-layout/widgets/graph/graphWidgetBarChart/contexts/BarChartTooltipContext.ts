import { type GraphWidgetTooltipItem } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { createRequiredContext } from '~/utils/createRequiredContext';

export type BarChartTooltipContextType = {
  showTooltip: (
    anchorElement: Element,
    items: GraphWidgetTooltipItem[],
    indexLabel: string,
    linkTo?: string,
    highlightedKey?: string,
  ) => void;
  hideTooltip: () => void;
  scheduleHide: () => void;
  cancelScheduledHide: () => void;
};

export const [
  BarChartTooltipContextProvider,
  useBarChartTooltipContextOrThrow,
] = createRequiredContext<BarChartTooltipContextType>('BarChartTooltipContext');
