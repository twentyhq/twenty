import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { type LineSeries, type SliceTooltipProps } from '@nivo/line';

export const graphWidgetLineTooltipComponentState = createAtomComponentState<{
  slice: SliceTooltipProps<LineSeries>['slice'];
  offsetLeft: number;
  offsetTop: number;
  highlightedSeriesId: string;
} | null>({
  key: 'graphWidgetLineTooltipComponentState',
  defaultValue: null,
  componentInstanceContext: WidgetComponentInstanceContext,
});
