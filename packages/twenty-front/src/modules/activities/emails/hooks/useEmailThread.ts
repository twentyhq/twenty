import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useOpenEmailThreadRightDrawer } from '@/activities/emails/right-drawer/hooks/useOpenEmailThreadRightDrawer';
import { viewableEmailThreadIdState } from '@/activities/emails/state/viewableEmailThreadIdState';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { isRightDrawerOpenState } from '@/ui/layout/right-drawer/states/isRightDrawerOpenState';

export const useEmailThread = () => {
  const [viewableEmailThreadId, setViewableEmailThreadId] = useRecoilState(
    viewableEmailThreadIdState(),
  );
  const { closeRightDrawer } = useRightDrawer();
  const openEmailThredRightDrawer = useOpenEmailThreadRightDrawer();
  const isRightDrawerOpen = useRecoilValue(isRightDrawerOpenState());
  const [isDrawerActive, setIsDrawerActive] = useState(false);

  useEffect(() => {
    if (isRightDrawerOpen) {
      setIsDrawerActive(true);
      return;
    }
    setIsDrawerActive(false);
  }, [isRightDrawerOpen]);

  const openEmailThread = (threadId: string) => {
    if (viewableEmailThreadId === threadId && isDrawerActive) {
      setViewableEmailThreadId(null);
      closeRightDrawer();
      return;
    }
    openEmailThredRightDrawer();
    setViewableEmailThreadId(threadId);
  };

  return { openEmailThread };
};
