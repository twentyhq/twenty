import { type ObjectPermissions } from 'twenty-shared/types';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
import { type UserWorkspace } from '~/generated-metadata/graphql';

export type CurrentUserWorkspace = Pick<
  UserWorkspace,
  'permissionFlags' | 'twoFactorAuthenticationMethodSummary'
> & {
  objectsPermissions: Array<ObjectPermissions & { objectMetadataId: string }>;
};

export const currentUserWorkspaceState =
  createStateV2<CurrentUserWorkspace | null>({
    key: 'currentUserWorkspaceState',
    defaultValue: null,
  });
