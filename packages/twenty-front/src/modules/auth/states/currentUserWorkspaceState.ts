import { ObjectPermissions } from 'twenty-shared/types';
import { createState } from 'twenty-ui/utilities';
import { UserWorkspace } from '~/generated/graphql';

export type CurrentUserWorkspace = Pick<
  UserWorkspace,
  | 'permissionFlags'
  | 'twoFactorAuthenticationMethodSummary'
  | 'objectRecordsPermissions'
> & {
  objectPermissions: Array<ObjectPermissions & { objectMetadataId: string }>;
};

export const currentUserWorkspaceState =
  createState<CurrentUserWorkspace | null>({
    key: 'currentUserWorkspaceState',
    defaultValue: null,
  });
