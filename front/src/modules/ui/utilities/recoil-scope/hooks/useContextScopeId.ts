import { useContext } from 'react';

import { RecoilScopeContext } from '@/types/RecoilScopeContext';

export function useRecoilScopeId(SpecificContext: RecoilScopeContext) {
  const recoilScopeId = useContext(SpecificContext);

  if (!recoilScopeId)
    throw new Error(
      `Using useContextScopedId outside of the specified context : ${SpecificContext.displayName}, verify that you are using a RecoilScope with the specific context you want to use.`,
    );

  return recoilScopeId;
}
