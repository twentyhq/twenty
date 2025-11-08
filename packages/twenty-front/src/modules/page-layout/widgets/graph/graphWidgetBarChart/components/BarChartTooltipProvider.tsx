import { GraphWidgetTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import {
  BarChartTooltipProvider as BarChartTooltipContextProvider,
  type BarChartTooltipContextType,
} from '@/page-layout/widgets/graph/graphWidgetBarChart/contexts/BarChartTooltipContext';
import { useTooltipFloating } from '@/page-layout/widgets/graph/hooks/useTooltipFloating';
import { useTheme } from '@emotion/react';
import { FloatingPortal } from '@floating-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useState, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

const TOOLTIP_SCROLLABLE_ITEM_THRESHOLD = 5;

type BarChartTooltipState = {
  anchorElement: Element;
  items: Parameters<BarChartTooltipContextType['showTooltip']>[1];
  indexLabel: string;
  highlightedKey?: string;
  showClickHint: boolean;
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
    ) => {
      setTooltipState({
        anchorElement,
        items,
        indexLabel,
        showClickHint,
        highlightedKey,
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

  const contextValue: BarChartTooltipContextType = {
    showTooltip,
    hideTooltip,
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
          >
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
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
                    TOOLTIP_SCROLLABLE_ITEM_THRESHOLD
                  }
                  showClickHint={tooltipState.showClickHint}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </FloatingPortal>
      )}
    </BarChartTooltipContextProvider>
  );
};
