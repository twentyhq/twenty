import { ScopeInternalContext } from '../types/ScopeInternalContext';

import { useScopeInternalContext } from './useScopeInternalContext';

export const useAvailableScopeIdOrThrow = <T extends { scopeId: string }>(
  Context: ScopeInternalContext<T>,
  scopeIdFromProps?: string,
): string => {
  const scopeInternalContext = useScopeInternalContext(Context);

  const scopeIdFromContext = scopeInternalContext?.scopeId;

  if (scopeIdFromProps) {
    return scopeIdFromProps;
  } else if (scopeIdFromContext) {
    return scopeIdFromContext;
  } else {
    throw new Error('Scope id is not provided and cannot be found in context.');
  }
};
