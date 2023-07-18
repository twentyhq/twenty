import { atom } from 'recoil';

import { AuthTokenPair } from '~/generated/graphql';
import { cookieStorageEffect } from '~/utils/recoil-effects';

export const tokenPairState = atom<AuthTokenPair | null>({
  key: 'tokenPairState',
  default: null,
  effects: [cookieStorageEffect('tokenPair')],
});
