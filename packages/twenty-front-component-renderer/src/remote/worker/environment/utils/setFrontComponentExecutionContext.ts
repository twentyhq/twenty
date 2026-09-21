import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';

import {
  FRONT_COMPONENT_CONTEXT_KEY,
  FRONT_COMPONENT_LISTENERS_KEY,
} from 'twenty-sdk/front-component-renderer';

type Listener = () => void;

const getListeners = (): Set<Listener> => {
  if (!(globalThis as Record<string, unknown>)[FRONT_COMPONENT_LISTENERS_KEY]) {
    (globalThis as Record<string, unknown>)[FRONT_COMPONENT_LISTENERS_KEY] =
      new Set<Listener>();
  }

  return (globalThis as Record<string, unknown>)[
    FRONT_COMPONENT_LISTENERS_KEY
  ] as Set<Listener>;
};

export const setFrontComponentExecutionContext = (
  context: FrontComponentExecutionContext,
): void => {
  (globalThis as Record<string, unknown>)[FRONT_COMPONENT_CONTEXT_KEY] =
    context;

  for (const listener of getListeners()) {
    listener();
  }
};
