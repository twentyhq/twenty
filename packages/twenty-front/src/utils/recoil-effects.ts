import { AtomEffect } from 'recoil';

import { cookieStorage } from '~/utils/cookie-storage';

import { isNonNullable } from './isNonNullable';

export const localStorageEffect =
  <T>(key: string): AtomEffect<T> =>
  ({ setSelf, onSet }) => {
    const savedValue = localStorage.getItem(key);
    if (savedValue != null) {
      setSelf(JSON.parse(savedValue));
    }

    onSet((newValue, _, isReset) => {
      isReset
        ? localStorage.removeItem(key)
        : localStorage.setItem(key, JSON.stringify(newValue));
    });
  };

export const cookieStorageEffect =
  <T>(key: string): AtomEffect<T | null> =>
  ({ setSelf, onSet }) => {
    const savedValue = cookieStorage.getItem(key);
    if (
      isNonNullable(savedValue) &&
      isNonNullable(JSON.parse(savedValue)['accessToken'])
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
