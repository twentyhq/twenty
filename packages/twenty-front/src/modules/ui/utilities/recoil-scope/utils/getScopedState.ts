import { RecoilScopedState } from '../types/RecoilScopedState';

export const getScopedState = <StateType>(
  recoilScopedState: RecoilScopedState<StateType>,
  scopeId: string,
) => {
  return recoilScopedState({
    scopeId,
  });
};
