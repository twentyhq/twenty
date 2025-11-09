import { GraphWidgetTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import {
  BarChartTooltipContextProvider,
  type BarChartTooltipContextType,
} from '@/page-layout/widgets/graph/graphWidgetBarChart/contexts/BarChartTooltipContext';
import { useTooltipFloating } from '@/page-layout/widgets/graph/hooks/useTooltipFloating';
import { BAR_CHART_TOOLTIP_SCROLLABLE_ITEM_THRESHOLD } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartTooltipScrollableItemThreshold';
import { useTheme } from '@emotion/react';
import { FloatingPortal } from '@floating-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { GRAPH_TOOLTIP_ANIMATION_SCALE_INITIAL } from '@/page-layout/widgets/graph/components/constants/GraphTooltipAnimationScaleInitial';
import { GRAPH_TOOLTIP_ANIMATION_SCALE_EXIT } from '@/page-layout/widgets/graph/components/constants/GraphTooltipAnimationScaleExit';
import { useCallback, useState, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

type BarChartTooltipState = {
  anchorElement: Element;
  items: Parameters<BarChartTooltipContextType['showTooltip']>[1];
  indexLabel: string;
  highlightedKey?: string;
  showClickHint: boolean;
  linkTo?: string;
  chartContainerId?: string;
};

type BarChartTooltipProviderProps = {
  children: ReactNode;
};

export const BarChartTooltipProvider = ({
  children,
}: BarChartTooltipProviderProps) => {
  const theme = useTheme();
  const [tooltipState, setTooltipState] = useState<BarChartTooltipState | null>(
    null,
  );

  const showTooltip = useCallback(
    (
      anchorElement: Element,
      items: BarChartTooltipState['items'],
      indexLabel: string,
      showClickHint: boolean,
      highlightedKey?: string,
      linkTo?: string,
      chartContainerId?: string,
    ) => {
      setTooltipState({
        anchorElement,
        items,
        indexLabel,
        showClickHint,
        highlightedKey,
        linkTo,
        chartContainerId,
      });
    },
    [],
  );

  const hideTooltip = useCallback(() => {
    setTooltipState(null);
  }, []);

  const isTooltipVisible = isDefined(tooltipState);

  const { refs, floatingStyles } = useTooltipFloating(
    tooltipState?.anchorElement ?? null,
  );

  const isEventInsideTooltip = useCallback(
    (target: EventTarget | null) => {
      const floatingEl = refs.floating?.current;
      return (
        Boolean(floatingEl) &&
        target instanceof Node &&
        floatingEl.contains(target as Node)
      );
    },
    [refs.floating],
  );

  const hideTooltipIfOutside = useCallback(
    (relatedTarget: EventTarget | null) => {
      if (!isEventInsideTooltip(relatedTarget)) {
        setTooltipState(null);
      }
    },
    [isEventInsideTooltip],
  );

  const contextValue: BarChartTooltipContextType = {
    showTooltip,
    hideTooltip,
    hideTooltipIfOutside,
    isEventInsideTooltip,
  };

  return (
    <BarChartTooltipContextProvider value={contextValue}>
      {children}
      {isTooltipVisible && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{ ...floatingStyles, zIndex: theme.lastLayerZIndex }}
            role="tooltip"
            aria-live="polite"
            onMouseLeave={(event) => {
              const related = event.relatedTarget as Node | null;
              const containerId = tooltipState?.chartContainerId;
              if (related && containerId) {
                const el = related instanceof Element ? related : null;
                const insideChart = el?.closest(`#${containerId}`);
                if (insideChart) {
                  // moving back to chart; do not hide
                  return;
                }
              }
              setTooltipState(null);
            }}
          >
            <AnimatePresence>
              <motion.div
                initial={{
                  opacity: 0,
                  scale: GRAPH_TOOLTIP_ANIMATION_SCALE_INITIAL,
                }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: GRAPH_TOOLTIP_ANIMATION_SCALE_EXIT }}
                transition={{
                  duration: theme.animation.duration.fast,
                  ease: 'easeInOut',
                }}
              >
                <GraphWidgetTooltip
                  items={tooltipState.items}
                  indexLabel={tooltipState.indexLabel}
                  highlightedKey={tooltipState.highlightedKey}
                  scrollable={
                    tooltipState.items.length >
                    BAR_CHART_TOOLTIP_SCROLLABLE_ITEM_THRESHOLD
                  }
                  showClickHint={tooltipState.showClickHint}
                  linkTo={tooltipState.linkTo}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </FloatingPortal>
      )}
    </BarChartTooltipContextProvider>
  );
};
