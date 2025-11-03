import { type AuthBypassProviders } from '~/generated/graphql';
import { createState } from 'twenty-ui/utilities';

export const workspaceAuthBypassProvidersState =
  createState<AuthBypassProviders | null>({
    key: 'workspaceAuthBypassProvidersState',
    defaultValue: null,
  });
