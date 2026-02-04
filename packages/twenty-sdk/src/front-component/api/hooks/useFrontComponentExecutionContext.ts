import { useSyncExternalStore } from 'react';
import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { type FrontComponentExecutionContextStore } from '../types/FrontComponentExecutionContextStore';

const getStore = (): FrontComponentExecutionContextStore => {
  const store = (globalThis as Record<string, unknown>)
    .frontComponentExecutionContextStore as
    | FrontComponentExecutionContextStore
    | undefined;

  if (store === undefined) {
    throw new Error(
      'frontComponentExecutionContextStore not found on globalThis. This hook must be used within a front component running in the worker.',
    );
  }

  return store;
};

export const useFrontComponentExecutionContext = ():
  | FrontComponentExecutionContext
  | undefined => {
  const store = getStore();

  return useSyncExternalStore(store.subscribe, store.getSnapshot);
};
