import { GraphWidgetTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import {
  LineChartTooltipContextProvider,
  type LineChartTooltipContextType,
} from '@/page-layout/widgets/graph/graphWidgetLineChart/contexts/LineChartTooltipContext';
import { useTooltipFloating } from '@/page-layout/widgets/graph/hooks/useTooltipFloating';
import { useTheme } from '@emotion/react';
import { FloatingPortal, type VirtualElement } from '@floating-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { GRAPH_TOOLTIP_ANIMATION_SCALE_INITIAL } from '@/page-layout/widgets/graph/components/constants/GraphTooltipAnimationScaleInitial';
import { GRAPH_TOOLTIP_ANIMATION_SCALE_EXIT } from '@/page-layout/widgets/graph/components/constants/GraphTooltipAnimationScaleExit';
import { useCallback, useState, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

type LineChartTooltipState = {
  virtualElement: VirtualElement;
  items: Parameters<LineChartTooltipContextType['showTooltip']>[1];
  indexLabel: string | undefined;
  highlightedSeriesId: string;
  scrollable: boolean;
  crosshairX: number;
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
    ) => {
      setTooltipState({
        virtualElement,
        items,
        indexLabel,
        highlightedSeriesId,
        scrollable,
        crosshairX,
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

  const contextValue: LineChartTooltipContextType = {
    showTooltip,
    hideTooltip,
    crosshairX: tooltipState?.crosshairX ?? null,
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
                  interactive={false}
                  showClickHint={false}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </FloatingPortal>
      )}
    </LineChartTooltipContextProvider>
  );
};
