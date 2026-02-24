import { type PieChartDataItemWithColor } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { type ComputedDatum } from '@nivo/pie';

export const graphWidgetPieTooltipComponentState = createComponentStateV2<{
  datum: ComputedDatum<PieChartDataItemWithColor>;
  offsetLeft: number;
  offsetTop: number;
} | null>({
  key: 'graphWidgetPieTooltipComponentState',
  defaultValue: null,
  componentInstanceContext: WidgetComponentInstanceContext,
});
