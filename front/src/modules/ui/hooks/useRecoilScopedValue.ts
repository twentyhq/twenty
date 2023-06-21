import { useContext } from 'react';
import { RecoilState, useRecoilValue } from 'recoil';

import { RecoilScopeContext } from './RecoilScopeContext';

export function useRecoilScopedValue<T>(
  recoilState: (param: string) => RecoilState<T>,
) {
  const recoilScopeId = useContext(RecoilScopeContext);

  if (!recoilScopeId)
    throw new Error(
      `Using a scoped atom without a RecoilScope : ${recoilState('').key}`,
    );

  return useRecoilValue<T>(recoilState(recoilScopeId));
}
