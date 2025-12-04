import { GraphWidgetComponentInstanceContext } from '@/page-layout/widgets/graph/states/contexts/GraphWidgetComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { type ComputedDatum } from '@nivo/pie';
import { type PieChartDataItem } from '../types/PieChartDataItem';

export const graphWidgetPieTooltipComponentState = createComponentState<{
  datum: ComputedDatum<PieChartDataItem>;
  offsetLeft: number;
  offsetTop: number;
} | null>({
  key: 'graphWidgetPieTooltipComponentState',
  defaultValue: null,
  componentInstanceContext: GraphWidgetComponentInstanceContext,
});
