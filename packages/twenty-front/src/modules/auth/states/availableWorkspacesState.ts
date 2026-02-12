import { createState } from '@/ui/utilities/state/utils/createState';
import { type AvailableWorkspaces } from '~/generated-metadata/graphql';

export const availableWorkspacesState = createState<AvailableWorkspaces>({
  key: 'availableWorkspacesState',
  defaultValue: {
    availableWorkspacesForSignIn: [],
    availableWorkspacesForSignUp: [],
  },
});
