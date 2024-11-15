import { createState } from 'twenty-ui';
import { UserExists } from '~/generated/graphql';

export const availableWorkspacesForAuthState = createState<
  UserExists['availableWorkspaces']
>({
  key: 'availableWorkspacesForAuthState',
  defaultValue: null,
});
