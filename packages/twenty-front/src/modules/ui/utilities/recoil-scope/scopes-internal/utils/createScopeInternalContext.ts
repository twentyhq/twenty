import { Context, createContext } from 'react';

import { RecoilComponentStateKey } from '@/ui/utilities/state/component-state/types/RecoilComponentStateKey';

type ScopeInternalContext<T extends RecoilComponentStateKey> =
  Context<T | null>;

export const createScopeInternalContext = <T extends RecoilComponentStateKey>(
  initialValue?: T,
) => {
  return createContext<T | null>(
    initialValue ?? null,
  ) as ScopeInternalContext<T>;
};
