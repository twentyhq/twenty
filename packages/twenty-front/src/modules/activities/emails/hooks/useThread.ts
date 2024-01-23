import { useRecoilState } from 'recoil';

import { MockedThread } from '@/activities/emails/mocks/mockedThreads';
import { useOpenThreadRightDrawer } from '@/activities/emails/right-drawer/hooks/useOpenThreadRightDrawer';
import { viewableThreadState } from '@/activities/emails/state/viewableThreadState';

export const useThread = () => {
  const [, setViewableThread] = useRecoilState(viewableThreadState);

  const openThredRightDrawer = useOpenThreadRightDrawer();

  const openThread = (thread: MockedThread) => {
    openThredRightDrawer();

    setViewableThread(thread);
  };

  return {
    openThread,
  };
};
