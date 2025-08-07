import { ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { ComponentStateType } from '@/ui/utilities/state/component-state/types/ComponentStateType';
import { RecoilValueReadOnly } from 'recoil';

export type ComponentReadOnlySelector<StateType> = {
  type: Extract<ComponentStateType, 'ComponentReadOnlySelector'>;
  key: string;
  selectorFamily: (
    componentStateKey: ComponentStateKey,
  ) => RecoilValueReadOnly<StateType>;
};
