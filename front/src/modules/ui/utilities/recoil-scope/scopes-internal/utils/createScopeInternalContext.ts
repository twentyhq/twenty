import { Context, createContext } from 'react';

import { ScopedStateKey } from '../types/ScopedStateKey';

type ScopeInternalContext<T extends ScopedStateKey> = Context<T | null>;

export const createScopeInternalContext = <T extends ScopedStateKey>(
  initialValue?: T,
) => {
  return createContext<T | null>(
    initialValue ?? null,
  ) as ScopeInternalContext<T>;
};
