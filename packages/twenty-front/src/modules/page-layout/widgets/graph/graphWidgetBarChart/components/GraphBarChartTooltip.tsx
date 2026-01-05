import { GraphWidgetFloatingTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetFloatingTooltip';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { graphWidgetBarTooltipComponentState } from '@/page-layout/widgets/graph/graphWidgetBarChart/states/graphWidgetBarTooltipComponentState';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { getBarChartTooltipData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartTooltipData';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { type RefObject } from 'react';
import { isDefined } from 'twenty-shared/utils';

type GraphBarChartTooltipProps = {
  containerRef: RefObject<HTMLDivElement>;
  enrichedKeys: BarChartEnrichedKey[];
  formatOptions: GraphValueFormatOptions;
  layout?: 'vertical' | 'horizontal';
  onSliceClick?: (slice: BarChartSlice) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export const GraphBarChartTooltip = ({
  containerRef,
  enrichedKeys,
  formatOptions,
  layout = 'vertical',
  onSliceClick,
  onMouseEnter,
  onMouseLeave,
}: GraphBarChartTooltipProps) => {
  const tooltipState = useRecoilComponentValue(
    graphWidgetBarTooltipComponentState,
  );

  const containerElement = containerRef.current;
  if (!isDefined(containerElement)) {
    return null;
  }

  const handleTooltipClick: (() => void) | undefined = isDefined(onSliceClick)
    ? () => {
        if (isDefined(tooltipState)) {
          onSliceClick(tooltipState.slice);
        }
      }
    : undefined;

  const tooltipData = !isDefined(tooltipState)
    ? null
    : getBarChartTooltipData({
        slice: tooltipState.slice,
        enrichedKeys,
        formatOptions,
        layout,
      });

  const reference = isDefined(tooltipState) ? tooltipState.anchorElement : null;

  return (
    <GraphWidgetFloatingTooltip
      reference={reference}
      boundary={containerElement}
      tooltipOffsetFromAnchorInPx={BAR_CHART_CONSTANTS.TOOLTIP_OFFSET_PX}
      items={tooltipData?.tooltipItems ?? []}
      indexLabel={tooltipData?.indexLabel}
      onGraphWidgetTooltipClick={handleTooltipClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};
