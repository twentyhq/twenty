import React, { useContext } from 'react';

export const createRequiredContext = <TContext>(name: string) => {
  const Context = React.createContext<TContext | undefined>(undefined);
  Context.displayName = `${name}Provider`;

  const useRequiredContext = (): TContext => {
    const context = useContext(Context);

    if (context === undefined) {
      throw new Error(
        `${name} context not found. Please wrap your component tree with <${Context.displayName}> before using use${name}().`,
      );
    }

    return context;
  };

  return [Context.Provider, useRequiredContext] as const;
};
