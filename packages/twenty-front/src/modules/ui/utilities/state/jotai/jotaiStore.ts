import { clearAllSessionLocalStorageKeys } from '@/auth/utils/clearSessionLocalStorageKeys';
import { createStore } from 'jotai';

export let jotaiStore = createStore();

export const resetJotaiStore = () => {
  clearAllSessionLocalStorageKeys();

  jotaiStore = createStore();

  return jotaiStore;
};
