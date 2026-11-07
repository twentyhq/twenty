import { useSyncExternalStore } from 'react';
import {
  getFrontComponentExecutionContext,
  subscribeToFrontComponentExecutionContext,
  unsubscribeFromFrontComponentExecutionContext,
} from '../context/frontComponentContext';
import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';

const subscribe = (listener: () => void) => {
  subscribeToFrontComponentExecutionContext(listener);

  return () => unsubscribeFromFrontComponentExecutionContext(listener);
};

export const useFrontComponentExecutionContext = <TSelected>(
  selector: (context: FrontComponentExecutionContext) => TSelected,
): TSelected =>
  selector(
    useSyncExternalStore(
      subscribe,
      getFrontComponentExecutionContext,
      getFrontComponentExecutionContext,
    ),
  );
