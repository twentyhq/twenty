import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { type ComputedDatum } from '@nivo/pie';
import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';

export const graphWidgetPieTooltipComponentState = createComponentState<{
  datum: ComputedDatum<PieChartDataItem>;
  offsetLeft: number;
  offsetTop: number;
} | null>({
  key: 'graphWidgetPieTooltipComponentState',
  defaultValue: null,
  componentInstanceContext: WidgetComponentInstanceContext,
});
