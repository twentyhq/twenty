import { GraphWidgetFloatingTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetFloatingTooltip';
import { LINE_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartConstants';
import { graphWidgetLineTooltipComponentState } from '@/page-layout/widgets/graph/graphWidgetLineChart/states/graphWidgetLineTooltipComponentState';
import { type LineChartEnrichedSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartEnrichedSeries';
import { getLineChartTooltipData } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/getLineChartTooltipData';
import { createVirtualElementFromContainerOffset } from '@/page-layout/widgets/graph/utils/createVirtualElementFromContainerOffset';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { type LineSeries, type Point } from '@nivo/line';
import { type RefObject } from 'react';
import { isDefined } from 'twenty-shared/utils';

type GraphLineChartTooltipProps = {
  containerRef: RefObject<HTMLDivElement>;
  enrichedSeries: LineChartEnrichedSeries[];
  formatOptions: GraphValueFormatOptions;
  onSliceClick?: (point: Point<LineSeries>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export const GraphLineChartTooltip = ({
  containerRef,
  enrichedSeries,
  formatOptions,
  onSliceClick,
  onMouseEnter,
  onMouseLeave,
}: GraphLineChartTooltipProps) => {
  const tooltipState = useRecoilComponentValue(
    graphWidgetLineTooltipComponentState,
  );

  const containerElement = containerRef.current;
  if (!isDefined(containerElement)) {
    return null;
  }

  const handleTooltipClick: (() => void) | undefined = isDefined(onSliceClick)
    ? () => {
        if (!isDefined(tooltipState)) return;

        const highlightedPoint = tooltipState.slice.points.find(
          (point) =>
            String(point.seriesId) === tooltipState.highlightedSeriesId,
        );

        if (!isDefined(highlightedPoint)) return;

        onSliceClick(highlightedPoint);
      }
    : undefined;

  const tooltipData = !isDefined(tooltipState)
    ? null
    : getLineChartTooltipData({
        slice: tooltipState.slice,
        enrichedSeries,
        formatOptions,
      });

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
      tooltipOffsetFromAnchorInPx={LINE_CHART_CONSTANTS.TOOLTIP_OFFSET_PX}
      items={tooltipData?.items ?? []}
      indexLabel={tooltipData?.indexLabel}
      highlightedKey={tooltipState?.highlightedSeriesId}
      onGraphWidgetTooltipClick={handleTooltipClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};
