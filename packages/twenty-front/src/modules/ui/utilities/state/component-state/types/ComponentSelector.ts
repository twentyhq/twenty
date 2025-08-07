import { ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { ComponentStateType } from '@/ui/utilities/state/component-state/types/ComponentStateType';
import { RecoilState } from 'recoil';

export type ComponentSelector<StateType> = {
  type: Extract<ComponentStateType, 'ComponentSelector'>;
  key: string;
  selectorFamily: (
    componentStateKey: ComponentStateKey,
  ) => RecoilState<StateType>;
};
