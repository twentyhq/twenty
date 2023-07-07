import { atom } from 'recoil';

import { AppFocus } from '../types/AppFocus';

export const appFocusHistoryState = atom<AppFocus[]>({
  key: 'appFocusHistoryState',
  default: ['none'],
});
