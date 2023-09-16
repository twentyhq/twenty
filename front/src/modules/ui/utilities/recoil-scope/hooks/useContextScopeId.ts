import { Context, useContext } from 'react';

export const useContextScopeId = (SpecificContext: Context<string | null>) => {
  const recoilScopeId = useContext(SpecificContext);

  if (!recoilScopeId)
    throw new Error(
      `Using useContextScopedId outside of the specified context : ${SpecificContext.displayName}, verify that you are using a RecoilScope with the specific context you want to use.`,
    );

  return recoilScopeId;
};
