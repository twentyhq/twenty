import {
  GraphWidgetTooltipProvider as GraphWidgetTooltipContextProvider,
  type GraphWidgetTooltipContextType,
} from '@/page-layout/widgets/graph/contexts/GraphWidgetTooltipContext';
import { type ReactNode, useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import { GraphWidgetTooltipWrapper } from './GraphWidgetTooltipWrapper';

type TooltipState = {
  anchorElement: Element | null;
  content: ReactNode | null;
};

type GraphWidgetTooltipProviderProps = {
  children: ReactNode;
};

export const GraphWidgetTooltipProvider = ({
  children,
}: GraphWidgetTooltipProviderProps) => {
  const [tooltipState, setTooltipState] = useState<TooltipState>({
    anchorElement: null,
    content: null,
  });

  const hideTooltip = useCallback(() => {
    setTooltipState({
      anchorElement: null,
      content: null,
    });
  }, []);

  const scheduleHide = useDebouncedCallback(hideTooltip, 300);

  const show = useCallback(
    (anchorElement: Element, content: ReactNode) => {
      scheduleHide.cancel();
      setTooltipState({
        anchorElement,
        content,
      });
    },
    [scheduleHide],
  );

  const cancelHide = useCallback(() => {
    scheduleHide.cancel();
  }, [scheduleHide]);

  const hide = useCallback(() => {
    scheduleHide.cancel();
    hideTooltip();
  }, [scheduleHide, hideTooltip]);

  const isVisible =
    isDefined(tooltipState.anchorElement) && isDefined(tooltipState.content);

  const contextValue: GraphWidgetTooltipContextType = {
    show,
    scheduleHide,
    cancelHide,
    hide,
  };

  return (
    <GraphWidgetTooltipContextProvider value={contextValue}>
      {children}
      <GraphWidgetTooltipWrapper
        isVisible={isVisible}
        anchorElement={tooltipState.anchorElement}
        content={tooltipState.content}
        onCancelHide={cancelHide}
        onHide={hide}
      />
    </GraphWidgetTooltipContextProvider>
  );
};
