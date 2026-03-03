import { type PieChartDataItemWithColor } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { type ComputedDatum } from '@nivo/pie';

export const graphWidgetPieTooltipComponentState = createAtomComponentState<{
  datum: ComputedDatum<PieChartDataItemWithColor>;
  offsetLeft: number;
  offsetTop: number;
} | null>({
  key: 'graphWidgetPieTooltipComponentState',
  defaultValue: null,
  componentInstanceContext: WidgetComponentInstanceContext,
});
