import { useRecoilCallback } from 'recoil';

import { useOpenEmailThreadRightDrawer } from '@/activities/emails/right-drawer/hooks/useOpenEmailThreadRightDrawer';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { isRightDrawerOpenState } from '@/ui/layout/right-drawer/states/isRightDrawerOpenState';

export const useEmailThread = () => {
  const { closeRightDrawer } = useRightDrawer();
  const { closeCommandMenu } = useCommandMenu();
  const openEmailThreadRightDrawer = useOpenEmailThreadRightDrawer();

  const openEmailThread = useRecoilCallback(
    ({ snapshot, set }) =>
      (threadId: string) => {
        const isRightDrawerOpen = snapshot
          .getLoadable(isRightDrawerOpenState)
          .getValue();

        const viewableEmailThreadId = snapshot
          .getLoadable(viewableRecordIdState)
          .getValue();

        if (isRightDrawerOpen && viewableEmailThreadId === threadId) {
          set(viewableRecordIdState, null);
          closeRightDrawer();
          closeCommandMenu();
          return;
        }

        openEmailThreadRightDrawer();
        set(viewableRecordIdState, threadId);
      },
    [closeRightDrawer, closeCommandMenu, openEmailThreadRightDrawer],
  );

  return { openEmailThread };
};
