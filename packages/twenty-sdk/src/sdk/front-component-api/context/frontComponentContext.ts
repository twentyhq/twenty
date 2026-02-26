import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';

type Listener = () => void;

const CONTEXT_KEY = '__twentySdkExecutionContext__';
const LISTENERS_KEY = '__twentySdkContextListeners__';

const getListeners = (): Set<Listener> => {
  if (!(globalThis as Record<string, unknown>)[LISTENERS_KEY]) {
    (globalThis as Record<string, unknown>)[LISTENERS_KEY] =
      new Set<Listener>();
  }

  return (globalThis as Record<string, unknown>)[
    LISTENERS_KEY
  ] as Set<Listener>;
};

export const setFrontComponentExecutionContext = (
  context: FrontComponentExecutionContext,
): void => {
  (globalThis as Record<string, unknown>)[CONTEXT_KEY] = context;

  for (const listener of getListeners()) {
    listener();
  }
};

export const getFrontComponentExecutionContext =
  (): FrontComponentExecutionContext => {
    return (globalThis as Record<string, unknown>)[
      CONTEXT_KEY
    ] as FrontComponentExecutionContext;
  };

export const subscribeToFrontComponentExecutionContext = (
  listener: Listener,
): void => {
  getListeners().add(listener);
};

export const unsubscribeFromFrontComponentExecutionContext = (
  listener: Listener,
): void => {
  getListeners().delete(listener);
};
