import { atom } from 'recoil';

import { GetCurrentUserQuery } from '~/generated/graphql';

type CurrentUser = GetCurrentUserQuery['currentUser'];

export const currentUserState = atom<CurrentUser | null>({
  key: 'currentUserState',
  default: null,
});
