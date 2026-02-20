import { atom } from 'recoil';

export const mountedHeadlessFrontComponentIdsState = atom<Set<string>>({
  key: 'mountedHeadlessFrontComponentIdsState',
  default: new Set(),
});
