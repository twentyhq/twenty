import { Context, useContext } from 'react';

import { isDefined } from '~/utils/isDefined';

export const useScopeInternalContext = <T>(
  ScopeInternalContext: Context<T | null>,
) => {
  const context = useContext(ScopeInternalContext);

  if (!isDefined(context)) {
    throw new Error(
      `Using a scope context without a ScopeInternalContext.Provider wrapper for context : ${ScopeInternalContext.displayName}.`,
    );
  }

  return context;
};
