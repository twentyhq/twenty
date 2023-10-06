import { Context, createContext } from 'react';

type ScopeInternalContext<T extends { scopeId: string }> = Context<T | null>;

export const createScopeInternalContext = <T extends { scopeId: string }>(
  initialValue?: T,
) => {
  return createContext<T | null>(
    initialValue ?? null,
  ) as ScopeInternalContext<T>;
};
