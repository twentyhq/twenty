import { type BarChartSliceHoverData } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSliceHoverData';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const graphWidgetBarTooltipComponentState =
  createComponentStateV2<BarChartSliceHoverData | null>({
    key: 'graphWidgetBarTooltipComponentState',
    defaultValue: null,
    componentInstanceContext: WidgetComponentInstanceContext,
  });
