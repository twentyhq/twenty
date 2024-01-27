import { atom } from 'recoil';

import { TimelineThread } from '~/generated/graphql';

export const viewableEmailThreadState = atom<TimelineThread | null>({
  key: 'viewableEmailThreadState',
  default: null,
});
