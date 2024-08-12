import { RIGHT_DRAWER_CLOSE_EVENT_NAME } from '@/ui/layout/right-drawer/utils/emitRightDrawerCloseEvent';
import { useEffect } from 'react';

export const useListenRightDrawerClose = (callback: () => void) => {
  useEffect(() => {
    window.addEventListener(RIGHT_DRAWER_CLOSE_EVENT_NAME, callback);

    return () => {
      window.removeEventListener(RIGHT_DRAWER_CLOSE_EVENT_NAME, callback);
    };
  }, [callback]);
};
