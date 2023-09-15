import { Context, useContext } from 'react';
import { RecoilState, useRecoilState } from 'recoil';

import { RecoilScopeContext } from '../states/RecoilScopeContext';

export function useRecoilScopedFamilyState<StateType>(
  recoilState: (familyUniqueId: string) => RecoilState<StateType>,
  uniqueIdInRecoilScope: string,
  CustomRecoilScopeContext?: Context<string | null>,
) {
  const recoilScopeId = useContext(
    CustomRecoilScopeContext ?? RecoilScopeContext,
  );

  if (!recoilScopeId)
    throw new Error(
      `Using a scoped atom without a RecoilScope : ${
        recoilState('').key
      }, verify that you are using a RecoilScope with a specific context if you intended to do so.`,
    );

  const familyUniqueId = recoilScopeId + uniqueIdInRecoilScope;

  return useRecoilState<StateType>(recoilState(familyUniqueId));
}
