import { atom } from 'recoil';

import { QueuedAction } from '../types/QueuedAction';

export const queuedActionsState = atom<QueuedAction[]>({
  key: 'queuedActionsState',
  default: [],
});
