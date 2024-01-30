import { useRecoilState } from 'recoil';

import { useOpenEmailThreadRightDrawer } from '@/activities/emails/right-drawer/hooks/useOpenEmailThreadRightDrawer';
import { viewableEmailThreadState } from '@/activities/emails/state/viewableEmailThreadState';
import { TimelineThread } from '~/generated/graphql';

export const useEmailThread = () => {
  const [, setViewableEmailThread] = useRecoilState(viewableEmailThreadState);

  const openEmailThredRightDrawer = useOpenEmailThreadRightDrawer();

  const openEmailThread = (thread: TimelineThread) => {
    openEmailThredRightDrawer();

    setViewableEmailThread(thread);
  };

  return {
    openEmailThread,
  };
};
