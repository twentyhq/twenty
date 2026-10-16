import React, { useContext } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';

export const createRequiredContext = <TContext>(debugName: string) => {
  const Context = React.createContext<TContext | undefined>(undefined);
  Context.displayName = doNotTranslate(`${debugName}Provider`);

  const useRequiredContextOrThrow = (): TContext => {
    const context = useContext(Context);

    if (context === undefined) {
      throw new Error(
        doNotTranslate(
          `${debugName} Context not found. Please wrap your component tree with <${Context.displayName}> before using use${debugName}OrThrow().`,
        ),
      );
    }

    return context;
  };

  return [Context.Provider, useRequiredContextOrThrow] as const;
};
