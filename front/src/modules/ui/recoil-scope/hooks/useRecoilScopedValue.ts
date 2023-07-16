import { Context, useContext } from 'react';
import { RecoilState, useRecoilValue } from 'recoil';

import { RecoilScopeContext } from '../states/RecoilScopeContext';

export function useRecoilScopedValue<T>(
  recoilState: (param: string) => RecoilState<T>,
  SpecificContext?: Context<string | null>,
) {
  const recoilScopeId = useContext(SpecificContext ?? RecoilScopeContext);

  if (!recoilScopeId)
    throw new Error(
      `Using a scoped atom without a RecoilScope : ${
        recoilState('').key
      }, verify that you are using a RecoilScope with a specific context if you intended to do so.`,
    );

  return useRecoilValue<T>(recoilState(recoilScopeId));
}
