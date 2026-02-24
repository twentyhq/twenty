import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { type LineSeries, type SliceTooltipProps } from '@nivo/line';

export const graphWidgetLineTooltipComponentState = createComponentStateV2<{
  slice: SliceTooltipProps<LineSeries>['slice'];
  offsetLeft: number;
  offsetTop: number;
  highlightedSeriesId: string;
} | null>({
  key: 'graphWidgetLineTooltipComponentState',
  defaultValue: null,
  componentInstanceContext: WidgetComponentInstanceContext,
});
