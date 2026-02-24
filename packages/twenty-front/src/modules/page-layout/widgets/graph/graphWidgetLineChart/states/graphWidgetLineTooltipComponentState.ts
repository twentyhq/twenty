import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';
import { type LineSeries, type SliceTooltipProps } from '@nivo/line';

export const graphWidgetLineTooltipComponentState = createComponentState<{
  slice: SliceTooltipProps<LineSeries>['slice'];
  offsetLeft: number;
  offsetTop: number;
  highlightedSeriesId: string;
} | null>({
  key: 'graphWidgetLineTooltipComponentState',
  defaultValue: null,
  componentInstanceContext: WidgetComponentInstanceContext,
});
