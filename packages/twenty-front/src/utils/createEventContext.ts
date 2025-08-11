import { type Context, createContext } from 'react';

type ObjectOfFunctions = {
  [key: string]: (...args: any[]) => void;
};

export type EventContext<T extends ObjectOfFunctions> =
  T extends ObjectOfFunctions ? T : never;

export const createEventContext = <T extends ObjectOfFunctions>(): Context<
  EventContext<T>
> => createContext<EventContext<T>>({} as EventContext<T>);
