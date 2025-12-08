import { GraphWidgetFloatingTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetFloatingTooltip';
import { PIE_CHART_TOOLTIP_OFFSET_PX } from '@/page-layout/widgets/graph/graphWidgetPieChart/constants/PieChartTooltipOffsetPx';
import { graphWidgetPieTooltipComponentState } from '@/page-layout/widgets/graph/graphWidgetPieChart/states/graphWidgetPieTooltipComponentState';
import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type PieChartEnrichedData } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartEnrichedData';
import { getPieChartTooltipData } from '@/page-layout/widgets/graph/graphWidgetPieChart/utils/getPieChartTooltipData';
import { createVirtualElementFromContainerOffset } from '@/page-layout/widgets/graph/utils/createVirtualElementFromContainerOffset';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { type RefObject } from 'react';
import { isDefined } from 'twenty-shared/utils';

type GraphPieChartTooltipProps = {
  containerRef: RefObject<HTMLDivElement>;
  enrichedData: PieChartEnrichedData[];
  formatOptions: GraphValueFormatOptions;
  displayType?: string;
  onSliceClick?: (datum: PieChartDataItem) => void;
};

export const GraphPieChartTooltip = ({
  containerRef,
  enrichedData,
  formatOptions,
  displayType,
  onSliceClick,
}: GraphPieChartTooltipProps) => {
  const tooltipState = useRecoilComponentValue(
    graphWidgetPieTooltipComponentState,
  );

  const containerElement = containerRef.current;
  if (!isDefined(containerElement)) {
    return null;
  }

  const tooltipData = !isDefined(tooltipState)
    ? null
    : getPieChartTooltipData({
        datum: tooltipState.datum,
        enrichedData,
        formatOptions,
        displayType,
      });

  const handleTooltipClick: (() => void) | undefined = isDefined(onSliceClick)
    ? () => {
        if (isDefined(tooltipState)) {
          onSliceClick(tooltipState.datum.data);
        }
      }
    : undefined;

  const reference = !isDefined(tooltipState)
    ? null
    : createVirtualElementFromContainerOffset(
        containerElement,
        tooltipState.offsetLeft,
        tooltipState.offsetTop,
      );

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
