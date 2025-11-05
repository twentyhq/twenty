import { useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

const TOOLTIP_HIDE_DELAY_MS = 300;

export const useTooltipDebouncedHide = (onHide: () => void) => {
  const debouncedHide = useDebouncedCallback(onHide, TOOLTIP_HIDE_DELAY_MS);

  const scheduleHide = useCallback(() => {
    debouncedHide();
  }, [debouncedHide]);

  const cancelHide = useCallback(() => {
    debouncedHide.cancel();
  }, [debouncedHide]);

  const hideImmediately = useCallback(() => {
    debouncedHide.cancel();
    onHide();
  }, [debouncedHide, onHide]);

  return {
    scheduleHide,
    cancelHide,
    hideImmediately,
  };
};
