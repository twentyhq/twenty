import { useSetRecoilState } from 'recoil';

import { useOpenEmailThreadRightDrawer } from '@/activities/emails/right-drawer/hooks/useOpenEmailThreadRightDrawer';
import { viewableEmailThreadIdState } from '@/activities/emails/state/viewableEmailThreadIdState';

export const useEmailThread = () => {
  const setViewableEmailThreadId = useSetRecoilState(
    viewableEmailThreadIdState(),
  );

  const openEmailThredRightDrawer = useOpenEmailThreadRightDrawer();

  const openEmailThread = (threadId: string) => {
    openEmailThredRightDrawer();

    setViewableEmailThreadId(threadId);
  };

  return {
    openEmailThread,
  };
};
