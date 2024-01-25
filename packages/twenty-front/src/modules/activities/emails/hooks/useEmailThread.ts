import { useRecoilState } from 'recoil';

import { MockedThread } from '@/activities/emails/mocks/mockedEmailThreads';
import { useOpenEmailThreadRightDrawer } from '@/activities/emails/right-drawer/hooks/useOpenEmailThreadRightDrawer';
import { viewableEmailThreadState } from '@/activities/emails/state/viewableEmailThreadState';

export const useEmailThread = () => {
  const [, setViewableEmailThread] = useRecoilState(viewableEmailThreadState);

  const openEmailThredRightDrawer = useOpenEmailThreadRightDrawer();

  const openEmailThread = (thread: MockedThread) => {
    openEmailThredRightDrawer();

    setViewableEmailThread(thread);
  };

  return {
    openEmailThread,
  };
};
