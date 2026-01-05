import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { type VirtualElement } from '@floating-ui/react';

export const graphWidgetBarTooltipComponentState = createComponentState<{
  slice: BarChartSlice;
  anchorElement: VirtualElement;
} | null>({
  key: 'graphWidgetBarTooltipComponentState',
  defaultValue: null,
  componentInstanceContext: WidgetComponentInstanceContext,
});
