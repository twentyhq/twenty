import { createState } from '@ui/utilities/state/utils/createState';

import { AuthProviders } from '~/generated/graphql';

export const authProvidersState = createState<AuthProviders>({
  key: 'authProvidersState',
  defaultValue: {
    google: true,
    magicLink: false,
    password: true,
    microsoft: false,
    sso: [],
  },
});
