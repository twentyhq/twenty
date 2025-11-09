import { GRAPH_TOOLTIP_ANIMATION_SCALE_EXIT } from '@/page-layout/widgets/graph/components/constants/GraphTooltipAnimationScaleExit';
import { GRAPH_TOOLTIP_ANIMATION_SCALE_INITIAL } from '@/page-layout/widgets/graph/components/constants/GraphTooltipAnimationScaleInitial';
import { GraphWidgetTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import {
  LineChartTooltipContextProvider,
  type LineChartTooltipContextType,
} from '@/page-layout/widgets/graph/graphWidgetLineChart/contexts/LineChartTooltipContext';
import { useTooltipFloating } from '@/page-layout/widgets/graph/hooks/useTooltipFloating';
import { useTheme } from '@emotion/react';
import { FloatingPortal, type VirtualElement } from '@floating-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useState, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

type LineChartTooltipState = {
  virtualElement: VirtualElement;
  items: Parameters<LineChartTooltipContextType['showTooltip']>[1];
  indexLabel: string | undefined;
  highlightedSeriesId: string;
  scrollable: boolean;
  crosshairX: number;
  linkTo?: string;
  chartContainerId?: string;
};

type LineChartTooltipProviderProps = {
  children: ReactNode;
};

export const LineChartTooltipProvider = ({
  children,
}: LineChartTooltipProviderProps) => {
  const theme = useTheme();
  const [tooltipState, setTooltipState] =
    useState<LineChartTooltipState | null>(null);

  const showTooltip = useCallback(
    (
      virtualElement: VirtualElement,
      items: LineChartTooltipState['items'],
      indexLabel: string | undefined,
      highlightedSeriesId: string,
      scrollable: boolean,
      crosshairX: number,
      linkTo?: string,
      chartContainerId?: string,
    ) => {
      setTooltipState({
        virtualElement,
        items,
        indexLabel,
        highlightedSeriesId,
        scrollable,
        crosshairX,
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
    tooltipState?.virtualElement ?? null,
  );

  const isEventInsideTooltip = useCallback(
    (target: EventTarget | null) => {
      const floatingEl = refs.floating?.current;
      return (
        Boolean(floatingEl) &&
        target instanceof Node &&
        floatingEl &&
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

  const contextValue: LineChartTooltipContextType = {
    showTooltip,
    hideTooltip,
    crosshairX: tooltipState?.crosshairX ?? null,
    hideTooltipIfOutside,
    isEventInsideTooltip,
  };

  return (
    <LineChartTooltipContextProvider value={contextValue}>
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
              if (isDefined(related) && isDefined(containerId)) {
                const el = related instanceof Element ? related : null;
                const insideChart = el?.closest(`#${containerId}`);
                if (isDefined(insideChart)) {
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
                  highlightedKey={tooltipState.highlightedSeriesId}
                  scrollable={tooltipState.scrollable}
                  interactive={Boolean(tooltipState.linkTo)}
                  showClickHint={Boolean(tooltipState.linkTo)}
                  linkTo={tooltipState.linkTo}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </FloatingPortal>
      )}
    </LineChartTooltipContextProvider>
  );
};
