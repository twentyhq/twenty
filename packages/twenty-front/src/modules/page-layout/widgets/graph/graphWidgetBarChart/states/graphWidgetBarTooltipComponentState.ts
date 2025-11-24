import { GraphWidgetComponentInstanceContext } from '@/page-layout/widgets/graph/states/contexts/GraphWidgetComponentInstanceContext';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { type ComputedDatum } from '@nivo/bar';

export const graphWidgetBarTooltipComponentState = createComponentState<{
  datum: ComputedDatum<BarChartDataItem>;
  anchorElement: Element;
} | null>({
  key: 'graphWidgetBarTooltipComponentState',
  defaultValue: null,
  componentInstanceContext: GraphWidgetComponentInstanceContext,
});
