import { atom } from 'recoil';

import { MockedThread } from '@/activities/emails/mocks/mockedEmailThreads';

export const viewableEmailThreadState = atom<MockedThread | null>({
  key: 'viewableEmailThreadState',
  default: null,
});
