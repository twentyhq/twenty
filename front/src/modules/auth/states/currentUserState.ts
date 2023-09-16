import { atom } from 'recoil';

import {
  User,
  UserSettings,
  Workspace,
  WorkspaceMember,
} from '~/generated/graphql';

export type CurrentUser = Pick<
  User,
  | 'id'
  | 'email'
  | 'displayName'
  | 'firstName'
  | 'lastName'
  | 'avatarUrl'
  | 'canImpersonate'
  | 'supportUserHash'
> & {
  workspaceMember: Pick<WorkspaceMember, 'id' | 'allowImpersonation'> & {
    workspace: Pick<
      Workspace,
      'id' | 'displayName' | 'domainName' | 'inviteHash' | 'logo'
    >;
    settings: Pick<UserSettings, 'id' | 'colorScheme' | 'locale'>;
  };
  settings: Pick<UserSettings, 'id' | 'colorScheme' | 'locale'>;
};

export const currentUserState = atom<CurrentUser | null>({
  key: 'currentUserState',
  default: null,
});
