import { RecoilState } from 'recoil';

import { ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';

export const extractComponentState = <StateType>(
  componentState: (
    componentStateKey: ComponentStateKey,
  ) => RecoilState<StateType>,
  scopeId: string,
) => {
  return componentState({ scopeId });
};
