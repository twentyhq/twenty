import { ReactElement } from 'react';
import { atom } from 'recoil';

export const contextMenuEntriesState = atom<ReactElement[]>({
  key: 'contextMenuEntriesState',
  default: [],
});
