import { GraphWidgetFloatingTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetFloatingTooltip';
import { type LineChartEnrichedSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartEnrichedSeries';
import { getLineChartTooltipData } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/getLineChartTooltipData';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { getTooltipReferenceFromLineChartPointAnchor } from '@/page-layout/widgets/graph/utils/getTooltipReferenceFromLineChartPointAnchor';
import { type LineSeries, type SliceTooltipProps } from '@nivo/line';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

type GraphLineChartTooltipProps = {
  slice: SliceTooltipProps<LineSeries>['slice'];
  offsetLeft: number;
  offsetTop: number;
  containerId: string;
  enrichedSeries: LineChartEnrichedSeries[];
  formatOptions: GraphValueFormatOptions;
  highlightedSeriesId?: string;
  linkTo?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export const GraphLineChartTooltip = ({
  slice,
  offsetLeft,
  offsetTop,
  containerId,
  enrichedSeries,
  formatOptions,
  highlightedSeriesId,
  linkTo,
  onMouseEnter,
  onMouseLeave,
}: GraphLineChartTooltipProps) => {
  const tooltipData = useMemo(
    () =>
      getLineChartTooltipData({
        slice,
        enrichedSeries,
        formatOptions,
      }),
    [slice, enrichedSeries, formatOptions],
  );

  const { reference, boundary } = useMemo(() => {
    try {
      return getTooltipReferenceFromLineChartPointAnchor(
        containerId,
        offsetLeft,
        offsetTop,
      );
    } catch {
      return { reference: null, boundary: null };
    }
  }, [containerId, offsetLeft, offsetTop]);

  if (!isDefined(reference) || !isDefined(boundary)) {
    return null;
  }

  return (
    <GraphWidgetFloatingTooltip
      reference={reference}
      boundary={boundary}
      items={tooltipData.items}
      indexLabel={tooltipData.indexLabel}
      highlightedKey={highlightedSeriesId}
      linkTo={linkTo}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};
