import { createState } from 'twenty-ui';

import { AuthProviders } from '~/generated/graphql';

export const workspaceAuthProvidersState = createState<AuthProviders>({
  key: 'workspaceAuthProvidersState',
  defaultValue: {
    google: true,
    magicLink: false,
    password: true,
    microsoft: false,
    sso: [],
  },
});
