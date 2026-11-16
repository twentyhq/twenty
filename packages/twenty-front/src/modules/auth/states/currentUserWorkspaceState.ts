import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';
import { type UserWorkspace } from '~/generated-metadata/graphql';

export type CurrentUserWorkspace = Pick<
  UserWorkspace,
  'permissionFlags' | 'twoFactorAuthenticationMethodSummary' | 'isImpersonating'
> & {
  objectRecordsPermissions: (ObjectRecordsPermissions & {
    objectMetadataId: string;
    // TODO(@charlesBochet): remove with its fragment selection and fallback once values persisted before 2.57 are gone
    restrictedFields?: Record<
      string,
      { canRead?: boolean | null; canUpdate?: boolean | null }
    >;
  })[];
};

export const currentUserWorkspaceState =
  createAtomState<CurrentUserWorkspace | null>({
    key: 'currentUserWorkspaceState',
    defaultValue: null,
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
  });
