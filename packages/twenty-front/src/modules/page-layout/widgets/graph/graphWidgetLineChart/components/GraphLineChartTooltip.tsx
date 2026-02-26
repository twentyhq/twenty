import { GraphWidgetFloatingTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetFloatingTooltip';
import { LINE_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartConstants';
import { graphWidgetLineTooltipComponentState } from '@/page-layout/widgets/graph/graphWidgetLineChart/states/graphWidgetLineTooltipComponentState';
import { type LineChartEnrichedSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartEnrichedSeries';
import { getLineChartTooltipData } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/getLineChartTooltipData';
import { createVirtualElementFromContainerOffset } from '@/page-layout/widgets/graph/utils/createVirtualElementFromContainerOffset';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type LineSeries, type Point } from '@nivo/line';
import { type RefObject } from 'react';
import { isDefined } from 'twenty-shared/utils';

type GraphLineChartTooltipProps = {
  containerRef: RefObject<HTMLDivElement>;
  enrichedSeries: LineChartEnrichedSeries[];
  formatOptions: GraphValueFormatOptions;
  isStacked?: boolean;
  onSliceClick?: (point: Point<LineSeries>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export const GraphLineChartTooltip = ({
  containerRef,
  enrichedSeries,
  formatOptions,
  isStacked = false,
  onSliceClick,
  onMouseEnter,
  onMouseLeave,
}: GraphLineChartTooltipProps) => {
  const graphWidgetLineTooltip = useAtomComponentStateValue(
    graphWidgetLineTooltipComponentState,
  );

  const containerElement = containerRef.current;
  if (!isDefined(containerElement)) {
    return null;
  }

  const handleTooltipClick: (() => void) | undefined = isDefined(onSliceClick)
    ? () => {
        if (!isDefined(graphWidgetLineTooltip)) return;

        const highlightedPoint = graphWidgetLineTooltip.slice.points.find(
          (point) =>
            String(point.seriesId) ===
            graphWidgetLineTooltip.highlightedSeriesId,
        );

        if (!isDefined(highlightedPoint)) return;

        onSliceClick(highlightedPoint);
      }
    : undefined;

  const tooltipData = !isDefined(graphWidgetLineTooltip)
    ? null
    : getLineChartTooltipData({
        slice: graphWidgetLineTooltip.slice,
        enrichedSeries,
        formatOptions,
        isStacked,
      });

  const reference = !isDefined(graphWidgetLineTooltip)
    ? null
    : createVirtualElementFromContainerOffset(
        containerElement,
        graphWidgetLineTooltip.offsetLeft,
        graphWidgetLineTooltip.offsetTop,
      );

  return (
    <GraphWidgetFloatingTooltip
      reference={reference}
      boundary={containerElement}
      tooltipOffsetFromAnchorInPx={LINE_CHART_CONSTANTS.TOOLTIP_OFFSET_PX}
      items={tooltipData?.items ?? []}
      indexLabel={tooltipData?.indexLabel}
      highlightedKey={graphWidgetLineTooltip?.highlightedSeriesId}
      onGraphWidgetTooltipClick={handleTooltipClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};
