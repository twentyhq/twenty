import { AtomEffect } from 'recoil';

import { cookieStorage } from '~/utils/cookie-storage';

import { isDefined } from './isDefined';

export const localStorageEffect =
  <T>(key?: string): AtomEffect<T> =>
  ({ setSelf, onSet, node }) => {
    const savedValue = localStorage.getItem(key ?? node.key);
    if (savedValue != null) {
      setSelf(JSON.parse(savedValue));
    }

    onSet((newValue, _, isReset) => {
      isReset
        ? localStorage.removeItem(key ?? node.key)
        : localStorage.setItem(key ?? node.key, JSON.stringify(newValue));
    });
  };

export const cookieStorageEffect =
  <T>(key: string): AtomEffect<T | null> =>
  ({ setSelf, onSet }) => {
    const savedValue = cookieStorage.getItem(key);
    if (
      isDefined(savedValue) &&
      isDefined(JSON.parse(savedValue)['accessToken'])
    ) {
      setSelf(JSON.parse(savedValue));
    }

    onSet((newValue, _, isReset) => {
      if (!newValue) {
        cookieStorage.removeItem(key);
        return;
      }
      isReset
        ? cookieStorage.removeItem(key)
        : cookieStorage.setItem(key, JSON.stringify(newValue), {
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          });
    });
  };
