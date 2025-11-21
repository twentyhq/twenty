import { GraphWidgetComponentInstanceContext } from '@/page-layout/widgets/graph/states/contexts/GraphWidgetComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { type LineSeries, type SliceTooltipProps } from '@nivo/line';

export const graphWidgetLineTooltipComponentState = createComponentState<{
  slice: SliceTooltipProps<LineSeries>['slice'];
  offsetLeft: number;
  offsetTop: number;
  highlightedSeriesId: string;
} | null>({
  key: 'graphWidgetLineTooltipComponentState',
  defaultValue: null,
  componentInstanceContext: GraphWidgetComponentInstanceContext,
});
