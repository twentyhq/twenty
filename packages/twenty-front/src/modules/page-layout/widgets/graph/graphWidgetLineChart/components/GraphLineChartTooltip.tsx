import { GraphWidgetFloatingTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetFloatingTooltip';
import { LINE_CHART_TOOLTIP_OFFSET_PX } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartTooltipOffsetPx';
import { graphWidgetLineTooltipComponentState } from '@/page-layout/widgets/graph/graphWidgetLineChart/states/graphWidgetLineTooltipComponentState';
import { type LineChartEnrichedSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartEnrichedSeries';
import { getLineChartTooltipData } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/getLineChartTooltipData';
import { getTooltipReferenceFromLineChartPointAnchor } from '@/page-layout/widgets/graph/utils/getTooltipReferenceFromLineChartPointAnchor';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { type LineSeries, type Point } from '@nivo/line';
import { isDefined } from 'twenty-shared/utils';

type GraphLineChartTooltipProps = {
  containerId: string;
  enrichedSeries: LineChartEnrichedSeries[];
  formatOptions: GraphValueFormatOptions;
  onSliceClick?: (point: Point<LineSeries>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export const GraphLineChartTooltip = ({
  containerId,
  enrichedSeries,
  formatOptions,
  onSliceClick,
  onMouseEnter,
  onMouseLeave,
}: GraphLineChartTooltipProps) => {
  const tooltipState = useRecoilComponentValue(
    graphWidgetLineTooltipComponentState,
  );

  const containerElement =
    typeof document !== 'undefined'
      ? document.getElementById(containerId)
      : null;
  if (!isDefined(containerElement)) {
    return null;
  }

  const isVisible = isDefined(tooltipState);

  const handleTooltipClick: (() => void) | undefined =
    isDefined(onSliceClick) && isVisible
      ? () => {
          const highlightedPoint = tooltipState.slice.points.find(
            (point) =>
              String(point.seriesId) === tooltipState.highlightedSeriesId,
          );

          if (!isDefined(highlightedPoint)) return;

          onSliceClick(highlightedPoint);
        }
      : undefined;

  const tooltipData = isVisible
    ? getLineChartTooltipData({
        slice: tooltipState.slice,
        enrichedSeries,
        formatOptions,
      })
    : null;

  let reference = null;

  if (isVisible) {
    try {
      const positioning = getTooltipReferenceFromLineChartPointAnchor(
        containerId,
        tooltipState.offsetLeft,
        tooltipState.offsetTop,
      );
      reference = positioning.reference;
    } catch {
      reference = null;
    }
  }

  return (
    <GraphWidgetFloatingTooltip
      reference={reference}
      boundary={containerElement}
      tooltipOffsetFromAnchorInPx={LINE_CHART_TOOLTIP_OFFSET_PX}
      items={tooltipData?.items ?? []}
      indexLabel={tooltipData?.indexLabel}
      highlightedKey={tooltipState?.highlightedSeriesId}
      onGraphWidgetTooltipClick={handleTooltipClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};
