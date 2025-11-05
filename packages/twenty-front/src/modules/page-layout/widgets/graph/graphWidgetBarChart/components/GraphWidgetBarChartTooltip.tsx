import { GraphWidgetTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { useBarChartTooltip } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartTooltip';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { useTheme } from '@emotion/react';
import { FloatingPortal } from '@floating-ui/react';
import { type ComputedDatum } from '@nivo/bar';
import { type CSSProperties } from 'react';
import { isDefined } from 'twenty-shared/utils';

type GraphWidgetBarChartTooltipProps = {
  floatingRef: (node: HTMLElement | null) => void;
  floatingStyles: CSSProperties;
  hoveredBarDatum: ComputedDatum<BarChartDataItem>;
  enrichedKeys: BarChartEnrichedKey[];
  data: BarChartDataItem[];
  indexBy: string;
  formatOptions: GraphValueFormatOptions;
  enableGroupTooltip?: boolean;
  onCancelHide: () => void;
  onRequestHide: () => void;
};

export const GraphWidgetBarChartTooltip = ({
  floatingRef,
  floatingStyles,
  hoveredBarDatum,
  enrichedKeys,
  data,
  indexBy,
  formatOptions,
  enableGroupTooltip = true,
  onCancelHide,
  onRequestHide,
}: GraphWidgetBarChartTooltipProps) => {
  const theme = useTheme();

  const { renderTooltip: getTooltipData } = useBarChartTooltip({
    enrichedKeys,
    data,
    indexBy,
    formatOptions,
    enableGroupTooltip,
  });

  const tooltipData = getTooltipData(hoveredBarDatum);

  if (!isDefined(tooltipData)) {
    return null;
  }

  return (
    <FloatingPortal>
      <div
        ref={floatingRef}
        style={{ ...floatingStyles, zIndex: theme.lastLayerZIndex }}
        role="tooltip"
        aria-live="polite"
        onMouseEnter={onCancelHide}
        onMouseLeave={onRequestHide}
      >
        <GraphWidgetTooltip
          items={tooltipData.tooltipItems}
          showClickHint={tooltipData.showClickHint}
          indexLabel={tooltipData.indexLabel}
          interactive
          scrollable
          highlightedKey={tooltipData.hoveredKey}
        />
      </div>
    </FloatingPortal>
  );
};
