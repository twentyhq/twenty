import { RecoilScopedState } from '../types/RecoilScopedState';

export const getScopedStateDeprecated = <StateType>(
  recoilScopedState: RecoilScopedState<StateType>,
  scopeId: string,
) => {
  return recoilScopedState({
    scopeId,
  });
};
