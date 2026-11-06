import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';
import { type UserWorkspace } from '~/generated-metadata/graphql';

export type CurrentUserWorkspace = Pick<
  UserWorkspace,
  'permissionFlags' | 'twoFactorAuthenticationMethodSummary' | 'isImpersonating'
> & {
  objectRecordsPermissions: (ObjectRecordsPermissions & {
    objectMetadataId: string;
  })[];
};

export const currentUserWorkspaceState =
  createAtomState<CurrentUserWorkspace | null>({
    key: 'currentUserWorkspaceState',
    defaultValue: null,
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
  });
