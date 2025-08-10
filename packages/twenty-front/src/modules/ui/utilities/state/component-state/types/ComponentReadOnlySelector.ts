import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { type ComponentStateType } from '@/ui/utilities/state/component-state/types/ComponentStateType';
import { type RecoilValueReadOnly } from 'recoil';

export type ComponentReadOnlySelector<StateType> = {
  type: Extract<ComponentStateType, 'ComponentReadOnlySelector'>;
  key: string;
  selectorFamily: (
    componentStateKey: ComponentStateKey,
  ) => RecoilValueReadOnly<StateType>;
};
