import { createState } from 'twenty-ui/utilities';
import { type AuthBypassProviders } from '~/generated/graphql';

export const authBypassProvidersState = createState<AuthBypassProviders>({
  key: 'authBypassProvidersState',
  defaultValue: {
    google: false,
    microsoft: false,
    password: false,
  },
});
