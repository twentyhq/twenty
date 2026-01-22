import { type PieChartDataItemWithColor } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { type ComputedDatum } from '@nivo/pie';

export const graphWidgetPieTooltipComponentState = createComponentState<{
  datum: ComputedDatum<PieChartDataItemWithColor>;
  offsetLeft: number;
  offsetTop: number;
} | null>({
  key: 'graphWidgetPieTooltipComponentState',
  defaultValue: null,
  componentInstanceContext: WidgetComponentInstanceContext,
});
