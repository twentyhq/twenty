import { RecoilScopedSelector } from '../types/RecoilScopedSelector';

export const getScopedSelector = <StateType>(
  recoilScopedState: RecoilScopedSelector<StateType>,
  scopeId: string,
) => {
  return recoilScopedState({
    scopeId,
  });
};
