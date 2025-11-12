import { GraphWidgetFloatingTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetFloatingTooltip';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { getBarChartTooltipData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartTooltipData';
import { graphWidgetBarTooltipComponentState } from '@/page-layout/widgets/graph/states/graphWidgetBarTooltipComponentState';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { getTooltipReferenceFromBarChartElementAnchor } from '@/page-layout/widgets/graph/utils/getTooltipReferenceFromBarChartElementAnchor';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

type GraphBarChartTooltipProps = {
  containerId: string;
  enrichedKeys: BarChartEnrichedKey[];
  data: BarChartDataItem[];
  indexBy: string;
  formatOptions: GraphValueFormatOptions;
  enableGroupTooltip?: boolean;
  layout?: 'vertical' | 'horizontal';
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export const GraphBarChartTooltip = ({
  containerId,
  enrichedKeys,
  data,
  indexBy,
  formatOptions,
  enableGroupTooltip = true,
  layout = 'vertical',
  onMouseEnter,
  onMouseLeave,
}: GraphBarChartTooltipProps) => {
  const tooltipState = useRecoilComponentValue(
    graphWidgetBarTooltipComponentState,
  );

  const tooltipData = useMemo(() => {
    if (!tooltipState) {
      return null;
    }

    return getBarChartTooltipData({
      datum: tooltipState.datum,
      enrichedKeys,
      data,
      indexBy,
      formatOptions,
      enableGroupTooltip,
      layout,
    });
  }, [
    tooltipState,
    enrichedKeys,
    data,
    indexBy,
    formatOptions,
    enableGroupTooltip,
    layout,
  ]);

  const { reference, boundary } = useMemo(() => {
    if (!tooltipState) {
      return { reference: null, boundary: null };
    }

    try {
      return getTooltipReferenceFromBarChartElementAnchor(
        tooltipState.anchorElement,
        containerId,
      );
    } catch {
      return { reference: null, boundary: null };
    }
  }, [tooltipState, containerId]);

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
      linkTo={tooltipData.linkTo}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};
