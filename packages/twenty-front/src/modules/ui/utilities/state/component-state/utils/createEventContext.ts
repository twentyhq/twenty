import { createContext } from 'react';

export const createEventContext = <
  Events extends Record<string, (...args: any) => void>,
>(
  initialValue?: Events,
) => {
  return createContext<Events>((initialValue ?? {}) as Events);
};
