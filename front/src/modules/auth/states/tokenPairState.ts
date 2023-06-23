import { atom, AtomEffect } from 'recoil';

import { cookieStorage } from '@/utils/cookie-storage';
import { AuthTokenPair } from '~/generated/graphql';

const cookieStorageEffect =
  (key: string): AtomEffect<AuthTokenPair | null> =>
  ({ setSelf, onSet }) => {
    const savedValue = cookieStorage.getItem(key);

    if (savedValue != null) {
      setSelf(JSON.parse(savedValue));
    }

    onSet((newValue, _, isReset) => {
      isReset
        ? cookieStorage.removeItem(key)
        : cookieStorage.setItem(key, JSON.stringify(newValue));
    });
  };

export const tokenPairState = atom<AuthTokenPair | null>({
  key: 'tokenPairState',
  default: null,
  effects: [cookieStorageEffect('tokenPair')],
});
