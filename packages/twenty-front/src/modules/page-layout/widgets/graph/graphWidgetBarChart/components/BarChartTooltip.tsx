import { GraphWidgetFloatingTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetFloatingTooltip';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { graphWidgetBarTooltipComponentState } from '@/page-layout/widgets/graph/graphWidgetBarChart/states/graphWidgetBarTooltipComponentState';
import { type BarChartDatum } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDatum';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { getBarChartTooltipData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartTooltipData';
import { createVirtualElementFromContainerOffset } from '@/page-layout/widgets/graph/utils/createVirtualElementFromContainerOffset';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { type RefObject } from 'react';
import { isDefined } from 'twenty-shared/utils';

type BarChartTooltipProps = {
  containerRef: RefObject<HTMLDivElement>;
  dataByIndexValue: Map<string, BarChartDatum>;
  enrichedKeys: BarChartEnrichedKey[];
  formatOptions: GraphValueFormatOptions;
  onSliceClick?: (slice: BarChartSlice) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export const BarChartTooltip = ({
  containerRef,
  dataByIndexValue,
  enrichedKeys,
  formatOptions,
  onSliceClick,
  onMouseEnter,
  onMouseLeave,
}: BarChartTooltipProps) => {
  const graphWidgetBarTooltip = useAtomComponentStateValue(
    graphWidgetBarTooltipComponentState,
  );

  const containerElement = containerRef.current;
  if (!isDefined(containerElement)) {
    return null;
  }

  const handleTooltipClick: (() => void) | undefined = isDefined(onSliceClick)
    ? () => {
        if (isDefined(graphWidgetBarTooltip)) {
          onSliceClick(graphWidgetBarTooltip.slice);
        }
      }
    : undefined;

  const tooltipData = !isDefined(graphWidgetBarTooltip)
    ? null
    : getBarChartTooltipData({
        slice: graphWidgetBarTooltip.slice,
        dataByIndexValue,
        enrichedKeys,
        formatOptions,
      });

  const reference = !isDefined(graphWidgetBarTooltip)
    ? null
    : createVirtualElementFromContainerOffset(
        containerElement,
        graphWidgetBarTooltip.offsetLeft,
        graphWidgetBarTooltip.offsetTop,
      );

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
