import { atom } from 'recoil';

import { AppFocus } from '../types/AppFocus';

export const appFocusState = atom<AppFocus>({
  key: 'appFocusState',
  default: 'none',
});
