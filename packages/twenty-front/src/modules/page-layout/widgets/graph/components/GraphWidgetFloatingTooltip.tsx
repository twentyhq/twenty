import { GraphWidgetTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { useTooltipFloating } from '@/page-layout/widgets/graph/hooks/useTooltipFloating';
import { type GraphWidgetTooltipData } from '@/page-layout/widgets/graph/types/GraphWidgetTooltipData';
import { getTooltipReferenceFromBarChartElementAnchor } from '@/page-layout/widgets/graph/utils/getTooltipReferenceFromBarChartElementAnchor';
import { getTooltipReferenceFromLineChartPointAnchor } from '@/page-layout/widgets/graph/utils/getTooltipReferenceFromLineChartPointAnchor';
import { useTheme } from '@emotion/react';
import { FloatingPortal, type VirtualElement } from '@floating-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

type GraphWidgetFloatingTooltipProps = {
  tooltipData: GraphWidgetTooltipData;
  onScheduleHide?: () => void;
  onCancelScheduledHide?: () => void;
};

export const GraphWidgetFloatingTooltip = ({
  tooltipData,
  onScheduleHide,
  onCancelScheduledHide,
}: GraphWidgetFloatingTooltipProps) => {
  const theme = useTheme();

  const { reference, boundary } = useMemo((): {
    reference: Element | VirtualElement | null;
    boundary: Element | null;
  } => {
    try {
      if (tooltipData.anchor.type === 'bar-element-anchor') {
        return getTooltipReferenceFromBarChartElementAnchor(
          tooltipData.anchor.element,
          tooltipData.anchor.containerId,
        );
      }

      return getTooltipReferenceFromLineChartPointAnchor(
        tooltipData.anchor.containerId,
        tooltipData.anchor.offsetLeft,
        tooltipData.anchor.offsetTop,
      );
    } catch {
      return { reference: null, boundary: null };
    }
  }, [tooltipData]);

  const { refs, floatingStyles } = useTooltipFloating(reference, boundary);

  if (
    !isDefined(tooltipData) ||
    !isDefined(boundary) ||
    !(boundary instanceof HTMLElement)
  ) {
    return null;
  }

  return (
    <FloatingPortal root={boundary}>
      <div
        ref={refs.setFloating}
        style={{ ...floatingStyles, zIndex: theme.lastLayerZIndex }}
        role="tooltip"
        aria-live="polite"
        onMouseEnter={() => onCancelScheduledHide?.()}
        onMouseLeave={() => onScheduleHide?.()}
      >
        <AnimatePresence>
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: theme.animation.duration.fast,
              ease: 'easeInOut',
            }}
          >
            <GraphWidgetTooltip
              items={tooltipData.items}
              indexLabel={tooltipData.indexLabel}
              highlightedKey={tooltipData.highlightedKey}
              linkTo={tooltipData.linkTo}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </FloatingPortal>
  );
};
