import { type AuthProviders } from '~/generated-metadata/graphql';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const authProvidersState = createStateV2<AuthProviders>({
  key: 'authProvidersState',
  defaultValue: {
    google: true,
    magicLink: false,
    password: true,
    microsoft: false,
    sso: [],
  },
});
