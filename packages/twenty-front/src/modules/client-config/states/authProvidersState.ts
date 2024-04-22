import { createState } from 'twenty-ui';

import { AuthProviders } from '~/generated/graphql';

export const authProvidersState = createState<AuthProviders>({
  key: 'authProvidersState',
  defaultValue: {
    google: false,
    magicLink: false,
    password: false,
    microsoft: false,
  },
});
