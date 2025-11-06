import { GraphWidgetTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { useBarChartTooltip } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartTooltip';
import { useTooltipFloating } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useTooltipFloating';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { useTheme } from '@emotion/react';
import { FloatingPortal } from '@floating-ui/react';
import { motion } from 'framer-motion';
import { type ComputedDatum } from '@nivo/bar';
import { isDefined } from 'twenty-shared/utils';

type GraphWidgetBarChartTooltipProps = {
  hoveredBarDatum: ComputedDatum<BarChartDataItem>;
  hoveredBarElement: SVGRectElement | null;
  enrichedKeys: BarChartEnrichedKey[];
  data: BarChartDataItem[];
  indexBy: string;
  formatOptions: GraphValueFormatOptions;
  enableGroupTooltip?: boolean;
  onCancelHide: () => void;
  onRequestHide: () => void;
};

export const GraphWidgetBarChartTooltip = ({
  hoveredBarDatum,
  hoveredBarElement,
  enrichedKeys,
  data,
  indexBy,
  formatOptions,
  enableGroupTooltip = true,
  onCancelHide,
  onRequestHide,
}: GraphWidgetBarChartTooltipProps) => {
  const theme = useTheme();

  const { refs, floatingStyles } = useTooltipFloating(hoveredBarElement);

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
        ref={refs.setFloating}
        style={{ ...floatingStyles, zIndex: theme.lastLayerZIndex }}
        role="tooltip"
        aria-live="polite"
        onMouseEnter={onCancelHide}
        onMouseLeave={onRequestHide}
      >
        <motion.div
          key={`${hoveredBarDatum.id}-${hoveredBarDatum.index}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{
            duration: theme.animation.duration.fast,
            ease: 'easeInOut',
          }}
        >
          <GraphWidgetTooltip
            items={tooltipData.tooltipItems}
            showClickHint={tooltipData.showClickHint}
            indexLabel={tooltipData.indexLabel}
            interactive
            scrollable
            highlightedKey={tooltipData.hoveredKey}
          />
        </motion.div>
      </div>
    </FloatingPortal>
  );
};
