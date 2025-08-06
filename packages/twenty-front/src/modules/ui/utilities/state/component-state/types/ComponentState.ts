import { ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { ComponentStateType } from '@/ui/utilities/state/component-state/types/ComponentStateType';
import { RecoilState } from 'recoil';

export type ComponentState<StateType> = {
  type: Extract<ComponentStateType, 'ComponentState'>;
  key: string;
  atomFamily: (componentStateKey: ComponentStateKey) => RecoilState<StateType>;
};
