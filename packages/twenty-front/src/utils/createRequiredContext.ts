import React, { useContext } from 'react';

export const createRequiredContext = <TContext>(debugName: string) => {
  const Context = React.createContext<TContext | undefined>(undefined);
  // oxlint-disable-next-line lingui/no-unlocalized-strings -- React DevTools needs a stable context display name.
  Context.displayName = `${debugName}Provider`;

  const useRequiredContextOrThrow = (): TContext => {
    const context = useContext(Context);

    if (context === undefined) {
      throw new Error(
        // oxlint-disable-next-line lingui/no-unlocalized-strings -- This is a developer-only context invariant diagnostic.
        `${debugName} Context not found. Please wrap your component tree with <${Context.displayName}> before using use${debugName}OrThrow().`,
      );
    }

    return context;
  };

  return [Context.Provider, useRequiredContextOrThrow] as const;
};
