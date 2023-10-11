import { useContext } from 'react';

import { isDefined } from '~/utils/isDefined';

import { ScopeInternalContext } from '../types/ScopeInternalContext';

export const useScopeInternalContextOrThrow = <T extends { scopeId: string }>(
  Context: ScopeInternalContext<T>,
) => {
  const context = useContext(Context);

  if (!isDefined(context)) {
    throw new Error(
      `Using a scope context without a ScopeInternalContext.Provider wrapper for context : ${Context.displayName}.`,
    );
  }

  return context;
};
