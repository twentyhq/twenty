import { atom } from 'recoil';

import { GetCurrentUserQuery } from '~/generated/graphql';

type OriginalCurrentUser = GetCurrentUserQuery['currentUser'];

type RequiredWorkspaceMember = {
  workspaceMember: NonNullable<OriginalCurrentUser['workspaceMember']>;
};

type WithoutWorkspaceMember = Omit<OriginalCurrentUser, 'workspaceMember'>;

export type CurrentUser = WithoutWorkspaceMember & RequiredWorkspaceMember;

export const currentUserState = atom<CurrentUser | null>({
  key: 'currentUserState',
  default: null,
});
