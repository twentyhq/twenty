import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { type CanvasBarSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/findSliceAtCanvasPosition';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const graphWidgetBarTooltipComponentState = createComponentState<{
  slice: BarChartSlice | CanvasBarSlice;
  offsetLeft: number;
  offsetTop: number;
} | null>({
  key: 'graphWidgetBarTooltipComponentState',
  defaultValue: null,
  componentInstanceContext: WidgetComponentInstanceContext,
});
