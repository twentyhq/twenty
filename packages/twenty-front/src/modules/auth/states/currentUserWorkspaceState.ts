import { type CurrentUserWorkspaceObjectPermissions } from '@/auth/types/CurrentUserWorkspaceObjectPermissions';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type UserWorkspace } from '~/generated-metadata/graphql';

export type CurrentUserWorkspace = Pick<
  UserWorkspace,
  'permissionFlags' | 'twoFactorAuthenticationMethodSummary' | 'isImpersonating'
> & {
  objectsPermissions: CurrentUserWorkspaceObjectPermissions[];
};

export const currentUserWorkspaceState =
  createAtomState<CurrentUserWorkspace | null>({
    key: 'currentUserWorkspaceState',
    defaultValue: null,
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
  });
