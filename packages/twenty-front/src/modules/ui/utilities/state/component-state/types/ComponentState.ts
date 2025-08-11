import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { type ComponentStateType } from '@/ui/utilities/state/component-state/types/ComponentStateType';
import { type RecoilState } from 'recoil';

export type ComponentState<StateType> = {
  type: Extract<ComponentStateType, 'ComponentState'>;
  key: string;
  atomFamily: (componentStateKey: ComponentStateKey) => RecoilState<StateType>;
};
