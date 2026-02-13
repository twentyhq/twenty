import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';

type Listener = () => void;

let executionContext: FrontComponentExecutionContext | undefined;

const listeners = new Set<Listener>();

export const setFrontComponentExecutionContext = (
  context: FrontComponentExecutionContext,
): void => {
  executionContext = context;

  for (const listener of listeners) {
    listener();
  }
};

export const getFrontComponentExecutionContext = ():
  | FrontComponentExecutionContext
  | undefined => {
  return executionContext;
};

export const subscribeToFrontComponentExecutionContext = (
  listener: Listener,
): void => {
  listeners.add(listener);
};

export const unsubscribeFromFrontComponentExecutionContext = (
  listener: Listener,
): void => {
  listeners.delete(listener);
};
