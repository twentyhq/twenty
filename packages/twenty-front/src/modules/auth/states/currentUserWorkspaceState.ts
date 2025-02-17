import { createState } from '@ui/utilities/state/utils/createState';
import { UserWorkspace } from '~/generated/graphql';

export type CurrentUserWorkspace = Pick<UserWorkspace, 'settingsPermissions'>;

export const currentUserWorkspaceState =
  createState<CurrentUserWorkspace | null>({
    key: 'currentUserWorkspaceState',
    defaultValue: null,
  });
