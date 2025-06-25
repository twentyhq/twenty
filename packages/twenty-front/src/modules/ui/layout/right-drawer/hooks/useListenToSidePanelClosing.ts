import { SIDE_PANEL_CLOSE_EVENT_NAME } from '@/ui/layout/right-drawer/utils/emitSidePanelCloseEvent';
import { useEffect } from 'react';

export const useListenToSidePanelClosing = (callback: () => void) => {
  useEffect(() => {
    window.addEventListener(SIDE_PANEL_CLOSE_EVENT_NAME, callback);

    return () => {
      window.removeEventListener(SIDE_PANEL_CLOSE_EVENT_NAME, callback);
    };
  }, [callback]);
};
