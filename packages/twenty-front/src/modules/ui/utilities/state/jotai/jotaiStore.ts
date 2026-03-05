import { createStore } from 'jotai';

export let jotaiStore = createStore();

export const resetJotaiStore = () => {
  jotaiStore = createStore();
  return jotaiStore;
};
