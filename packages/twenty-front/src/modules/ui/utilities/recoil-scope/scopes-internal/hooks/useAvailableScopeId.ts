import { isNonEmptyString } from '@sniptt/guards';

import { ScopeInternalContext } from '../types/ScopeInternalContext';

import { useScopeInternalContext } from './useScopeInternalContext';

export const useAvailableScopeIdOrThrow = <T extends { scopeId: string }>(
  Context: ScopeInternalContext<T>,
  scopeIdFromProps?: string,
): string => {
  const scopeInternalContext = useScopeInternalContext(Context);

  const scopeIdFromContext = scopeInternalContext?.scopeId;

  if (isNonEmptyString(scopeIdFromProps)) {
    return scopeIdFromProps;
  } else if (isNonEmptyString(scopeIdFromContext)) {
    return scopeIdFromContext;
  } else {
    throw new Error(
      `Scope id is not provided and cannot be found in context.\n` +
        `Context: ${Context.displayName || 'Unknown'}\n` +
        `ScopeInternalContext.scopeId: ${scopeInternalContext?.scopeId || 'Unknown'}`,
    );
  }
};
