import { createState } from 'twenty-ui/utilities';
import { AvailableWorkspaces } from '~/generated/graphql';

export const availableWorkspacesState = createState<AvailableWorkspaces>({
  key: 'availableWorkspacesState',
  defaultValue: {
    availableWorkspacesForSignIn: [],
    availableWorkspacesForSignUp: [],
  },
});
