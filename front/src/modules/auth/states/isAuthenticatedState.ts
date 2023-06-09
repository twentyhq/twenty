import { selector } from 'recoil';

import { currentUserState } from './currentUserState';

export const isAuthenticatedState = selector<boolean>({
  key: 'isAuthenticatedState',
  get: ({ get }) => {
    const user = get(currentUserState);
    return !!user;
  },
});
