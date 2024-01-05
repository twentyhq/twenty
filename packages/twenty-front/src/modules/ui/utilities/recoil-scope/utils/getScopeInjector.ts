import { RecoilState } from 'recoil';

import { RecoilScopedState } from '../types/RecoilScopedState';

export type ScopeInjector<StateType> = (
  scopeId: string,
) => RecoilState<StateType>;

export const getScopeInjector = <StateType>(
  scopedState: RecoilScopedState<StateType>,
): ScopeInjector<StateType> => {
  return (scopeId: string) =>
    scopedState({
      scopeId,
    });
};
