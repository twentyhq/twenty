import { useContext } from 'react';

import { isNonNullable } from '~/utils/isNonNullable';

import { ScopeInternalContext } from '../types/ScopeInternalContext';

export const useScopeInternalContextOrThrow = <T extends { scopeId: string }>(
  Context: ScopeInternalContext<T>,
) => {
  const context = useContext(Context);

  if (!isNonNullable(context)) {
    throw new Error(
      `Using a scope context without a ScopeInternalContext.Provider wrapper for context : ${Context.displayName}.`,
    );
  }

  return context;
};
