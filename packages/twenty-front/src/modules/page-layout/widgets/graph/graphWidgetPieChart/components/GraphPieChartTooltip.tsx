import { GraphWidgetFloatingTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetFloatingTooltip';
import { graphWidgetPieTooltipComponentState } from '@/page-layout/widgets/graph/graphWidgetPieChart/states/graphWidgetPieTooltipComponentState';
import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type PieChartEnrichedData } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartEnrichedData';
import { getPieChartTooltipData } from '@/page-layout/widgets/graph/graphWidgetPieChart/utils/getPieChartTooltipData';
import { createVirtualElementFromContainerOffset } from '@/page-layout/widgets/graph/utils/createVirtualElementFromContainerOffset';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

type GraphPieChartTooltipProps = {
  containerId: string;
  enrichedData: PieChartEnrichedData[];
  formatOptions: GraphValueFormatOptions;
  displayType?: string;
  onSliceClick?: (datum: PieChartDataItem) => void;
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

  if (!isDefined(tooltipState)) {
    return null;
  }

  const containerElement = document.getElementById(containerId);
  if (!isDefined(containerElement)) {
    return null;
  }

  const tooltipData = getPieChartTooltipData({
    datum: tooltipState.datum,
    enrichedData,
    formatOptions,
    displayType,
  });

  const handleTooltipClick: (() => void) | undefined = isDefined(onSliceClick)
    ? () => onSliceClick(tooltipState.datum.data)
    : undefined;

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
      onGraphWidgetTooltipClick={handleTooltipClick}
    />
  );
};
