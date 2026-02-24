import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
import { type AvailableWorkspaces } from '~/generated-metadata/graphql';

export const availableWorkspacesState = createStateV2<AvailableWorkspaces>({
  key: 'availableWorkspacesState',
  defaultValue: {
    availableWorkspacesForSignIn: [],
    availableWorkspacesForSignUp: [],
  },
});
