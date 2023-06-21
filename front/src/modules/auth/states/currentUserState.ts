import { atom } from 'recoil';

import { User, Workspace, WorkspaceMember } from '~/generated/graphql';

type CurrentUser = Pick<User, 'id' | 'email' | 'displayName'> & {
  workspaceMember?:
    | (Pick<WorkspaceMember, 'id'> & {
        workspace: Pick<Workspace, 'id' | 'displayName' | 'logo'>;
      })
    | null;
};

export const currentUserState = atom<CurrentUser | null>({
  key: 'currentUserState',
  default: null,
});
