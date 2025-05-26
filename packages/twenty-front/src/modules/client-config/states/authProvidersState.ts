import { createState } from 'twenty-ui/utilities';
import { AuthProviders } from '~/generated/graphql';

export const authProvidersState = createState<AuthProviders>({
  key: 'authProvidersState',
  defaultValue: {
    google: false,
    password: false,
    microsoft: false,
    sso: [],
  },
});
