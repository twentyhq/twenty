import { RecoilState } from 'recoil';

import { ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';

export const extractComponentSelector = <StateType>(
  componentSelector: (
    componentStateKey: ComponentStateKey,
  ) => RecoilState<StateType>,
  scopeId: string,
) => {
  return () => componentSelector({ scopeId });
};
