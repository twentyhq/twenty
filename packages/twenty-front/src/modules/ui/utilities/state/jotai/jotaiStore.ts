import { clearAllSessionLocalStorageKeys } from '@/auth/utils/clearAllSessionLocalStorageKeys';
import { createStore } from 'jotai';

export let jotaiStore = createStore();

export const resetJotaiStore = () => {
  clearAllSessionLocalStorageKeys();

  jotaiStore = createStore();

  return jotaiStore;
};
