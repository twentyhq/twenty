import { GraphWidgetFloatingTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetFloatingTooltip';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { graphWidgetBarTooltipComponentState } from '@/page-layout/widgets/graph/graphWidgetBarChart/states/graphWidgetBarTooltipComponentState';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { getBarChartTooltipData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartTooltipData';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { type BarDatum, type ComputedDatum } from '@nivo/bar';
import { type RefObject } from 'react';
import { isDefined } from 'twenty-shared/utils';

type GraphBarChartTooltipProps = {
  containerRef: RefObject<HTMLDivElement>;
  enrichedKeys: BarChartEnrichedKey[];
  formatOptions: GraphValueFormatOptions;
  enableGroupTooltip?: boolean;
  layout?: 'vertical' | 'horizontal';
  onBarClick?: (datum: ComputedDatum<BarDatum>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export const GraphBarChartTooltip = ({
  containerRef,
  enrichedKeys,
  formatOptions,
  enableGroupTooltip = true,
  layout = 'vertical',
  onBarClick,
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

  const handleTooltipClick: (() => void) | undefined = isDefined(onBarClick)
    ? () => {
        if (isDefined(tooltipState)) {
          onBarClick(tooltipState.datum);
        }
      }
    : undefined;

  const tooltipData = !isDefined(tooltipState)
    ? null
    : getBarChartTooltipData({
        datum: tooltipState.datum,
        enrichedKeys,
        formatOptions,
        enableGroupTooltip,
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
      highlightedKey={tooltipData?.hoveredKey}
      onGraphWidgetTooltipClick={handleTooltipClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};
