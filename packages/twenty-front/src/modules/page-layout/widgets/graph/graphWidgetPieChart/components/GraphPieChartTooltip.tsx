import { GraphWidgetFloatingTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetFloatingTooltip';
import { usePieChartTooltip } from '@/page-layout/widgets/graph/graphWidgetPieChart/hooks/usePieChartTooltip';
import { graphWidgetPieTooltipComponentState } from '@/page-layout/widgets/graph/graphWidgetPieChart/states/graphWidgetPieTooltipComponentState';
import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type PieChartEnrichedData } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartEnrichedData';
import { createVirtualElementFromContainerOffset } from '@/page-layout/widgets/graph/utils/createVirtualElementFromContainerOffset';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { type ComputedDatum } from '@nivo/pie';
import { isDefined } from 'twenty-shared/utils';

type GraphPieChartTooltipProps = {
  containerId: string;
  enrichedData: PieChartEnrichedData[];
  formatOptions: GraphValueFormatOptions;
  displayType?: string;
  onSliceClick?: (datum: ComputedDatum<PieChartDataItem>) => void;
};

export const GraphPieChartTooltip = ({
  containerId,
  enrichedData,
  formatOptions,
  displayType,
  onSliceClick,
}: GraphPieChartTooltipProps) => {
  const tooltipState = useRecoilComponentValue(
    graphWidgetPieTooltipComponentState,
  );

  const { createTooltipData } = usePieChartTooltip({
    enrichedData,
    formatOptions,
    displayType,
  });

  if (!isDefined(tooltipState)) {
    return null;
  }

  const containerElement = document.getElementById(containerId);
  if (!isDefined(containerElement)) {
    return null;
  }

  const tooltipData = createTooltipData(tooltipState.datum);
  if (!isDefined(tooltipData)) {
    return null;
  }

  const reference = createVirtualElementFromContainerOffset(
    containerElement,
    tooltipState.offsetLeft,
    tooltipState.offsetTop,
  );

  return (
    <GraphWidgetFloatingTooltip
      reference={reference}
      boundary={containerElement}
      items={[tooltipData.tooltipItem]}
      disablePointerEvents
      onGraphWidgetTooltipClick={() => onSliceClick?.(tooltipState.datum)}
    />
  );
};
