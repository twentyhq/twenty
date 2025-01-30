import { createState } from 'twenty-ui';

import { AuthProviders } from '~/generated/graphql';

export const workspaceAuthProvidersState = createState<AuthProviders | null>({
  key: 'workspaceAuthProvidersState',
  defaultValue: null,
});
