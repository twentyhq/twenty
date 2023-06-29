import { atom } from 'recoil';

export const queuedActionsState = atom<string[]>({
  key: 'queuedActionsState',
  default: [],
});
