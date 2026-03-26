import { type FrontComponentExecutionContext } from 'twenty-sdk';

// These keys MUST match the ones in twenty-sdk's frontComponentContext.ts
// so the getter (in the SDK) and setter (here) share state via globalThis.
const CONTEXT_KEY = '__twentySdkExecutionContext__';
const LISTENERS_KEY = '__twentySdkContextListeners__';

type Listener = () => void;

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
