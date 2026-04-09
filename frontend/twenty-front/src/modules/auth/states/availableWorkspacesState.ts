import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type AvailableWorkspaces } from '~/generated-metadata/graphql';

export const availableWorkspacesState = createAtomState<AvailableWorkspaces>({
  key: 'availableWorkspacesState',
  defaultValue: {
    availableWorkspacesForSignIn: [],
    availableWorkspacesForSignUp: [],
  },
});
