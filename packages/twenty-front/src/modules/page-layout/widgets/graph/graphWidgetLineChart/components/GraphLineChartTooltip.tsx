import { GraphWidgetFloatingTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetFloatingTooltip';
import { graphWidgetLineTooltipComponentState } from '@/page-layout/widgets/graph/graphWidgetLineChart/states/graphWidgetLineTooltipComponentState';
import { type LineChartEnrichedSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartEnrichedSeries';
import { getLineChartTooltipData } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/getLineChartTooltipData';
import { getTooltipReferenceFromLineChartPointAnchor } from '@/page-layout/widgets/graph/utils/getTooltipReferenceFromLineChartPointAnchor';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
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
  const tooltipData = !isDefined(tooltipState)
    ? null
    : getLineChartTooltipData({
        slice: tooltipState.slice,
        enrichedSeries,
        formatOptions,
      });

  let reference = null;
  let boundary = null;

  if (isDefined(tooltipState)) {
    try {
      const positioning = getTooltipReferenceFromLineChartPointAnchor(
        containerId,
        tooltipState.offsetLeft,
        tooltipState.offsetTop,
      );
      reference = positioning.reference;
      boundary = positioning.boundary;
    } catch {
      reference = null;
      boundary = null;
    }
  }

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
