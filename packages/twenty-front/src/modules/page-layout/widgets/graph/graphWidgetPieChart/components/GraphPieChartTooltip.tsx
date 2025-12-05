import { GraphWidgetFloatingTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetFloatingTooltip';
import { PIE_CHART_TOOLTIP_OFFSET_PX } from '@/page-layout/widgets/graph/graphWidgetPieChart/constants/PieChartTooltipOffsetPx';
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

  const containerElement =
    typeof document !== 'undefined'
      ? document.getElementById(containerId)
      : null;
  if (!isDefined(containerElement)) {
    return null;
  }

  const isVisible = isDefined(tooltipState);

  const tooltipData = isVisible
    ? getPieChartTooltipData({
        datum: tooltipState.datum,
        enrichedData,
        formatOptions,
        displayType,
      })
    : null;

  const handleTooltipClick: (() => void) | undefined =
    isDefined(onSliceClick) && isVisible
      ? () => onSliceClick(tooltipState.datum.data)
      : undefined;

  const reference = isVisible
    ? createVirtualElementFromContainerOffset(
        containerElement,
        tooltipState.offsetLeft,
        tooltipState.offsetTop,
      )
    : null;

  return (
    <GraphWidgetFloatingTooltip
      reference={reference}
      boundary={containerElement}
      tooltipOffsetFromAnchorInPx={PIE_CHART_TOOLTIP_OFFSET_PX}
      items={tooltipData?.tooltipItem ? [tooltipData.tooltipItem] : []}
      disablePointerEvents
      onGraphWidgetTooltipClick={handleTooltipClick}
    />
  );
};
