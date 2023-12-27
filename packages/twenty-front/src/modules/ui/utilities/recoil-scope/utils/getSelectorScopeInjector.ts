import { RecoilState } from 'recoil';

import { RecoilScopedSelector } from '@/ui/utilities/recoil-scope/types/RecoilScopedSelector';

export type ScopeInjector<StateType> = (
  scopeId: string,
) => RecoilState<StateType>;

export const getSelectorScopeInjector = <StateType>(
  scopedSelector: RecoilScopedSelector<StateType>,
) => {
  return (scopeId: string) =>
    scopedSelector({
      scopeId,
    });
};
