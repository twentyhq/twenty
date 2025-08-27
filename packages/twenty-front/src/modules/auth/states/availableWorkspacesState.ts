import { createState } from 'twenty-ui/utilities';
import { type AvailableWorkspaces } from '~/generated/graphql';

export const availableWorkspacesState = createState<AvailableWorkspaces>({
  key: 'availableWorkspacesState',
  defaultValue: {
    availableWorkspacesForSignIn: [],
    availableWorkspacesForSignUp: [],
  },
});
