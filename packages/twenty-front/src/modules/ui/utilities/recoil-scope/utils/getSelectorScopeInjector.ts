import { RecoilValueReadOnly } from 'recoil';

import { RecoilScopedSelector } from '@/ui/utilities/recoil-scope/types/RecoilScopedSelector';

export type SelectorScopeInjector<StateType> = (
  scopeId: string,
) => RecoilValueReadOnly<StateType>;

export const getSelectorScopeInjector = <StateType>(
  scopedSelector: RecoilScopedSelector<StateType>,
): SelectorScopeInjector<StateType> => {
  return (scopeId: string) =>
    scopedSelector({
      scopeId,
    });
};
