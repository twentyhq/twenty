import { type CurrentUserWorkspaceObjectRecordsPermissions } from '@/auth/types/CurrentUserWorkspaceObjectRecordsPermissions';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type UserWorkspace } from '~/generated-metadata/graphql';

export type CurrentUserWorkspace = Pick<
  UserWorkspace,
  'permissionFlags' | 'twoFactorAuthenticationMethodSummary' | 'isImpersonating'
> & {
  objectRecordsPermissions: CurrentUserWorkspaceObjectRecordsPermissions[];
};

export const currentUserWorkspaceState =
  createAtomState<CurrentUserWorkspace | null>({
    // versioned so a value cached with the legacy permissions shape is never restored
    key: 'currentUserWorkspaceState:v2',
    defaultValue: null,
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
  });
