import { Context, useContext } from 'react';
import { RecoilState, useRecoilState } from 'recoil';

import { RecoilScopeContext } from '../states/RecoilScopeContext';

export function useRecoilScopedState<StateType>(
  recoilState: (param: string) => RecoilState<StateType>,
  SpecificContext?: Context<string | null>,
) {
  const recoilScopeId = useContext(SpecificContext ?? RecoilScopeContext);

  if (!recoilScopeId)
    throw new Error(
      `Using a scoped atom without a RecoilScope : ${
        recoilState('').key
      }, verify that you are using a RecoilScope with a specific context if you intended to do so.`,
    );

  return useRecoilState<StateType>(recoilState(recoilScopeId));
}
