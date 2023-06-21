import { useContext } from 'react';
import { RecoilState, useRecoilState } from 'recoil';

import { RecoilScopeContext } from './RecoilScopeContext';

export function useRecoilScopedState<T>(
  recoilState: (param: string) => RecoilState<T>,
) {
  const recoilScopeId = useContext(RecoilScopeContext);

  if (!recoilScopeId)
    throw new Error(
      `Using a scoped atom without a RecoilScope : ${recoilState('').key}`,
    );

  return useRecoilState<T>(recoilState(recoilScopeId));
}
