import { useRecoilCallback } from 'recoil';

import { useOpenEmailThreadRightDrawer } from '@/activities/emails/right-drawer/hooks/useOpenEmailThreadRightDrawer';
import { viewableEmailThreadIdState } from '@/activities/emails/states/viewableEmailThreadIdState';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { isRightDrawerOpenState } from '@/ui/layout/right-drawer/states/isRightDrawerOpenState';

export const useEmailThread = () => {
  const { closeRightDrawer } = useRightDrawer();
  const openEmailThredRightDrawer = useOpenEmailThreadRightDrawer();

  const openEmailThread = useRecoilCallback(
    ({ snapshot, set }) =>
      (threadId: string) => {
        const isRightDrawerOpen = snapshot
          .getLoadable(isRightDrawerOpenState)
          .getValue();

        const viewableEmailThreadId = snapshot
          .getLoadable(viewableEmailThreadIdState)
          .getValue();

        if (isRightDrawerOpen && viewableEmailThreadId === threadId) {
          set(viewableEmailThreadIdState, null);
          closeRightDrawer();
          return;
        }

        openEmailThredRightDrawer();
        set(viewableEmailThreadIdState, threadId);
      },
    [closeRightDrawer, openEmailThredRightDrawer],
  );

  return { openEmailThread };
};
