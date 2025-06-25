import { SIDE_PANEL_OPEN_EVENT_NAME } from '@/ui/layout/right-drawer/utils/emitSidePanelOpenEvent';
import { useEffect } from 'react';

export const useListenToSidePanelOpening = (callback: () => void) => {
  useEffect(() => {
    window.addEventListener(SIDE_PANEL_OPEN_EVENT_NAME, callback);

    return () => {
      window.removeEventListener(SIDE_PANEL_OPEN_EVENT_NAME, callback);
    };
  }, [callback]);
};
