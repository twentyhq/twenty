import { atom } from 'recoil';

import { GetCurrentUserQuery } from '~/generated/graphql';

export type CurrentUser = GetCurrentUserQuery['currentUser'];

export const currentUserState = atom<CurrentUser | null>({
  key: 'currentWorkspaceMemberState',
  default: null,
});
