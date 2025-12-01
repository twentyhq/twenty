import { GraphWidgetFloatingTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetFloatingTooltip';
import { graphWidgetBarTooltipComponentState } from '@/page-layout/widgets/graph/graphWidgetBarChart/states/graphWidgetBarTooltipComponentState';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { getBarChartTooltipData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartTooltipData';
import { getTooltipReferenceFromBarChartElementAnchor } from '@/page-layout/widgets/graph/utils/getTooltipReferenceFromBarChartElementAnchor';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { type BarDatum, type ComputedDatum } from '@nivo/bar';
import { isDefined } from 'twenty-shared/utils';

type GraphBarChartTooltipProps = {
  containerId: string;
  enrichedKeys: BarChartEnrichedKey[];
  formatOptions: GraphValueFormatOptions;
  enableGroupTooltip?: boolean;
  layout?: 'vertical' | 'horizontal';
  onBarClick?: (datum: ComputedDatum<BarDatum>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export const GraphBarChartTooltip = ({
  containerId,
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

  let reference = null;
  let boundary = null;

  if (isDefined(tooltipState)) {
    try {
      const positioning = getTooltipReferenceFromBarChartElementAnchor(
        tooltipState.anchorElement,
        containerId,
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
      items={tooltipData.tooltipItems}
      indexLabel={tooltipData.indexLabel}
      highlightedKey={tooltipData.hoveredKey}
      onGraphWidgetTooltipClick={handleTooltipClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};
