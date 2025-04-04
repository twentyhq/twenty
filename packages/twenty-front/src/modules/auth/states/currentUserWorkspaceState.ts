import { UserWorkspace } from '~/generated/graphql';
import { createState } from 'twenty-ui/utilities';

export type CurrentUserWorkspace = Pick<
  UserWorkspace,
  'settingsPermissions' | 'objectRecordsPermissions'
>;

export const currentUserWorkspaceState =
  createState<CurrentUserWorkspace | null>({
    key: 'currentUserWorkspaceState',
    defaultValue: null,
  });
