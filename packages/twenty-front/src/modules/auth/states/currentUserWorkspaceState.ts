import { createState } from 'twenty-ui/utilities';
import { UserWorkspace } from '~/generated/graphql';

export type CurrentUserWorkspace = Pick<
  UserWorkspace,
  'settingsPermissions' | 'objectRecordsPermissions' | 'objectPermissions'
>;

export const currentUserWorkspaceState =
  createState<CurrentUserWorkspace | null>({
    key: 'currentUserWorkspaceState',
    defaultValue: null,
  });
