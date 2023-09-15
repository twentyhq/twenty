import { useContext } from 'react';

import { RecoilScopeContext } from '@/types/RecoilScopeContext';

export function useRecoilScopeId(RecoilScopeContext: RecoilScopeContext) {
  const recoilScopeId = useContext(RecoilScopeContext);

  if (!recoilScopeId)
    throw new Error(
      `Using useRecoilScopeId outside of the specified context : ${RecoilScopeContext.displayName}, verify that you are using a RecoilScope with the specific context you want to use.`,
    );

  return recoilScopeId;
}
