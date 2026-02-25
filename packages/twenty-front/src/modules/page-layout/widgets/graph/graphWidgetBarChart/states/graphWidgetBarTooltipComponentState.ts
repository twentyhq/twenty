import { type BarChartSliceHoverData } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSliceHoverData';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const graphWidgetBarTooltipComponentState =
  createAtomComponentState<BarChartSliceHoverData | null>({
    key: 'graphWidgetBarTooltipComponentState',
    defaultValue: null,
    componentInstanceContext: WidgetComponentInstanceContext,
  });
