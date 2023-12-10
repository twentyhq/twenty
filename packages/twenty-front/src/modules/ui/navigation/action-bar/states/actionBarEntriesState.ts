import { atom } from 'recoil';

import { ActionBarEntry } from '../types/ActionBarEntry';

export const actionBarEntriesState = atom<ActionBarEntry[]>({
  key: 'actionBarEntriesState',
  default: [],
});
