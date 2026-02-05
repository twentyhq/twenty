import { type FrontComponentExecutionContext } from './FrontComponentExecutionContext';

export type FrontComponentExecutionContextStore = {
  getSnapshot: () => FrontComponentExecutionContext | undefined;
  subscribe: (listener: () => void) => () => void;
};
