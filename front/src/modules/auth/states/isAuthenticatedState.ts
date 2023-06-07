import { selector } from 'recoil';

import { currentUserState } from './currentUserState';

export const isAuthenticatedState = selector<boolean>({
  key: 'auth/is-authenticated',
  get: ({ get }) => {
    const user = get(currentUserState);
    return !!user;
  },
});
