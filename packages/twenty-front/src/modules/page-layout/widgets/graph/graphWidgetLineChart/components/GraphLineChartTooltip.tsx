import { GraphWidgetFloatingTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetFloatingTooltip';
import { type LineChartEnrichedSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartEnrichedSeries';
import { getLineChartTooltipData } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/getLineChartTooltipData';
import { graphWidgetLineTooltipComponentState } from '@/page-layout/widgets/graph/states/graphWidgetLineTooltipComponentState';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { getTooltipReferenceFromLineChartPointAnchor } from '@/page-layout/widgets/graph/utils/getTooltipReferenceFromLineChartPointAnchor';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

type GraphLineChartTooltipProps = {
  containerId: string;
  enrichedSeries: LineChartEnrichedSeries[];
  formatOptions: GraphValueFormatOptions;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export const GraphLineChartTooltip = ({
  containerId,
  enrichedSeries,
  formatOptions,
  onMouseEnter,
  onMouseLeave,
}: GraphLineChartTooltipProps) => {
  const tooltipState = useRecoilComponentValue(
    graphWidgetLineTooltipComponentState,
  );
  const tooltipData = useMemo(() => {
    if (!tooltipState) {
      return null;
    }

    return getLineChartTooltipData({
      slice: tooltipState.slice,
      enrichedSeries,
      formatOptions,
    });
  }, [tooltipState, enrichedSeries, formatOptions]);

  const { reference, boundary } = useMemo(() => {
    if (!tooltipState) {
      return { reference: null, boundary: null };
    }

    try {
      return getTooltipReferenceFromLineChartPointAnchor(
        containerId,
        tooltipState.offsetLeft,
        tooltipState.offsetTop,
      );
    } catch {
      return { reference: null, boundary: null };
    }
  }, [containerId, tooltipState]);

  if (
    !isDefined(tooltipData) ||
    !isDefined(reference) ||
    !isDefined(boundary)
  ) {
    return null;
  }

  return (
    <GraphWidgetFloatingTooltip
      reference={reference}
      boundary={boundary}
      items={tooltipData.items}
      indexLabel={tooltipData.indexLabel}
      highlightedKey={tooltipState?.highlightedSeriesId}
      linkTo={tooltipState?.linkTo}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};
