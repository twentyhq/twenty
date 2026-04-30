import { FRONT_COMPONENT_CONTEXT_KEY } from '../constants/front-component-context-key';
import { FRONT_COMPONENT_LISTENERS_KEY } from '../constants/front-component-listeners-key';

import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';

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

export const getFrontComponentExecutionContext =
  (): FrontComponentExecutionContext => {
    return (globalThis as Record<string, unknown>)[
      FRONT_COMPONENT_CONTEXT_KEY
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
