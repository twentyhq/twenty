import { RecoilValueReadOnly } from 'recoil';

import { ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';

export const extractComponentReadOnlySelector = <StateType>(
  componentSelector: (
    componentStateKey: ComponentStateKey,
  ) => RecoilValueReadOnly<StateType>,
  scopeId: string,
) => {
  return () => componentSelector({ scopeId });
};
