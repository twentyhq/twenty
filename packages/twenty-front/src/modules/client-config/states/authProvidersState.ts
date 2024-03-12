import { createState } from '@/ui/utilities/state/utils/createState';
import { AuthProviders } from '~/generated/graphql';

export const authProvidersState = createState<AuthProviders>({
  key: 'authProvidersState',
  defaultValue: { google: false, magicLink: false, password: true },
});
