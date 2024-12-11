import React, { useContext } from 'react';

export const createRequiredContext = <TContext>() => {
  const Context = React.createContext<TContext | undefined>(undefined);

  const useRequiredContextOrThrow = (): TContext => {
    const context = useContext(Context);

    if (context === undefined) {
      throw new Error(
        `Context not found. Please wrap your component tree within the required Provider.`,
      );
    }

    return context;
  };

  return [Context.Provider, useRequiredContextOrThrow] as const;
};
