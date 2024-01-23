import { atom } from 'recoil';

import { MockedThread } from '@/activities/emails/mocks/mockedThreads';

export const viewableThreadState = atom<MockedThread | null>({
  key: 'viewableThreadState',
  default: null,
});
