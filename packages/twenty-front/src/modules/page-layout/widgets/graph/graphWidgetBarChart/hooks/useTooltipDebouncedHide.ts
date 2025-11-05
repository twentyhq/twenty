import { useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

const TOOLTIP_HIDE_DELAY_MS = 300;

export const useTooltipDebouncedHide = (onTooltipHide: () => void) => {
  const debouncedTooltipHide = useDebouncedCallback(
    onTooltipHide,
    TOOLTIP_HIDE_DELAY_MS,
  );

  const scheduleTooltipHide = useCallback(() => {
    debouncedTooltipHide();
  }, [debouncedTooltipHide]);

  const cancelTooltipHide = useCallback(() => {
    debouncedTooltipHide.cancel();
  }, [debouncedTooltipHide]);

  const hideTooltipImmediately = useCallback(() => {
    debouncedTooltipHide.cancel();
    onTooltipHide();
  }, [debouncedTooltipHide, onTooltipHide]);

  return {
    scheduleTooltipHide,
    cancelTooltipHide,
    hideTooltipImmediately,
  };
};
