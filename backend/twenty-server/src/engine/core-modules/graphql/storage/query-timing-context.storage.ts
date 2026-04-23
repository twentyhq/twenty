import { AsyncLocalStorage } from 'async_hooks';

export const queryTimingContextStorage = new AsyncLocalStorage<boolean>();

export const isQueryTimingEnabled = (): boolean =>
  queryTimingContextStorage.getStore() === true;
