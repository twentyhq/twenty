import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';
import { type UserWorkspace } from '~/generated-metadata/graphql';

export type CurrentUserWorkspace = Pick<
  UserWorkspace,
  'permissionFlags' | 'twoFactorAuthenticationMethodSummary' | 'isImpersonating'
> & {
  objectRecordsPermissions: (ObjectRecordsPermissions & {
    objectMetadataId: string;
    // TODO: remove this, its fragment selection and withFieldListsFromRestrictedFields once values
    // persisted by bundles older than 2.57 are gone; the server field is deprecated
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
