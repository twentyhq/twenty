import { type BarChartSliceHoverData } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSliceHoverData';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const graphWidgetBarTooltipComponentState =
  createComponentState<BarChartSliceHoverData | null>({
    key: 'graphWidgetBarTooltipComponentState',
    defaultValue: null,
    componentInstanceContext: WidgetComponentInstanceContext,
  });
