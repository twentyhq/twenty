import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';
import { type UserWorkspace } from '~/generated-metadata/graphql';

export type CurrentUserWorkspace = Pick<
  UserWorkspace,
  'permissionFlags' | 'twoFactorAuthenticationMethodSummary' | 'isImpersonating'
> & {
  objectRecordsPermissions: (ObjectRecordsPermissions & {
    objectMetadataId: string;
    // This value is persisted, so it can be read by a bundle older or newer than the one that wrote it
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
