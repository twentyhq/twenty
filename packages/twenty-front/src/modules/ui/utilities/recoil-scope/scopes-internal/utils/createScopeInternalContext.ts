import { Context, createContext } from 'react';

import { StateScopeMapKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/StateScopeMapKey';

type ScopeInternalContext<T extends StateScopeMapKey> = Context<T | null>;

export const createScopeInternalContext = <T extends StateScopeMapKey>(
  initialValue?: T,
) => {
  return createContext<T | null>(
    initialValue ?? null,
  ) as ScopeInternalContext<T>;
};
