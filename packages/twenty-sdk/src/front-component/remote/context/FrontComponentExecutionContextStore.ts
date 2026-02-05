import { type FrontComponentExecutionContext } from '../../types/FrontComponentExecutionContext';

type Listener = () => void;

export class FrontComponentExecutionContextStore {
  private context: FrontComponentExecutionContext | undefined = undefined;
  private listeners = new Set<Listener>();

  getSnapshot = (): FrontComponentExecutionContext | undefined => {
    return this.context;
  };

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  };

  setContext = (context: FrontComponentExecutionContext): void => {
    this.context = context;
    for (const listener of this.listeners) {
      listener();
    }
  };
}

export const frontComponentExecutionContextStore =
  new FrontComponentExecutionContextStore();
