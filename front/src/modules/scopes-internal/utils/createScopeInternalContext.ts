import { createContext } from 'react';

export const createScopeInternalContext = <T extends { scopeId: string }>(
  initialValue?: T,
) => {
  return createContext<T | null>(initialValue ?? null);
};
