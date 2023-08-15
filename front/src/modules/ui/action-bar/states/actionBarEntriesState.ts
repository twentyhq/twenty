import { ReactElement } from 'react';
import { atom } from 'recoil';

export const actionBarEntriesState = atom<ReactElement[]>({
  key: 'actionBarEntriesState',
  default: [],
});
