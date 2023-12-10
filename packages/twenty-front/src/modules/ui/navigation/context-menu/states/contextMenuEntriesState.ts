import { atom } from 'recoil';

import { ContextMenuEntry } from '../types/ContextMenuEntry';

export const contextMenuEntriesState = atom<ContextMenuEntry[]>({
  key: 'contextMenuEntriesState',
  default: [],
});
