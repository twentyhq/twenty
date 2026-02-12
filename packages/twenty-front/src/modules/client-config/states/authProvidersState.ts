import { type AuthProviders } from '~/generated-metadata/graphql';
import { createState } from '@/ui/utilities/state/utils/createState';

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
