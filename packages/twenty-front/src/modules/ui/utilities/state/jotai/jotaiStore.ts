import { createStore } from 'jotai';

export let jotaiStore = createStore();

export const resetJotaiStore = () => {
  try {
    localStorage.clear();
  } catch {
    // localStorage may be unavailable in some environments
  }

  jotaiStore = createStore();

  return jotaiStore;
};
