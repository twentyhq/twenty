import { type AtomEffect } from 'recoil';

export const localStorageEffect =
  <T>(key?: string): AtomEffect<T> =>
  ({ setSelf, onSet, node }) => {
    const savedValue = localStorage.getItem(key ?? node.key);
    if (savedValue != null) {
      try {
        setSelf(JSON.parse(savedValue));
      } catch {
        // Invalid JSON in localStorage, ignore and use default value
        localStorage.removeItem(key ?? node.key);
      }
    }

    onSet((newValue, _, isReset) => {
      isReset
        ? localStorage.removeItem(key ?? node.key)
        : localStorage.setItem(key ?? node.key, JSON.stringify(newValue));
    });
  };
