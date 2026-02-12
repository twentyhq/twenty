import { createState } from 'twenty-ui/utilities';
import { type AvailableWorkspaces } from '~/generated-metadata/graphql';

export const availableWorkspacesState = createState<AvailableWorkspaces>({
  key: 'availableWorkspacesState',
  defaultValue: {
    availableWorkspacesForSignIn: [],
    availableWorkspacesForSignUp: [],
  },
});
