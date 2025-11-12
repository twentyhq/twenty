import { GraphWidgetFloatingTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetFloatingTooltip';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { getBarChartTooltipData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartTooltipData';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { getTooltipReferenceFromBarChartElementAnchor } from '@/page-layout/widgets/graph/utils/getTooltipReferenceFromBarChartElementAnchor';
import { type BarDatum, type ComputedDatum } from '@nivo/bar';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

type GraphBarChartTooltipProps = {
  datum: ComputedDatum<BarDatum>;
  anchorElement: Element;
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
  datum,
  anchorElement,
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
  const tooltipData = useMemo(
    () =>
      getBarChartTooltipData({
        datum,
        enrichedKeys,
        data,
        indexBy,
        formatOptions,
        enableGroupTooltip,
        layout,
      }),
    [
      datum,
      enrichedKeys,
      data,
      indexBy,
      formatOptions,
      enableGroupTooltip,
      layout,
    ],
  );

  const { reference, boundary } = useMemo(() => {
    try {
      return getTooltipReferenceFromBarChartElementAnchor(
        anchorElement,
        containerId,
      );
    } catch {
      return { reference: null, boundary: null };
    }
  }, [anchorElement, containerId]);

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
