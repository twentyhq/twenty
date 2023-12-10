import { atom } from 'recoil';

import { AuthProviders } from '~/generated/graphql';

export const authProvidersState = atom<AuthProviders>({
  key: 'authProvidersState',
  default: { google: false, magicLink: false, password: true },
});
