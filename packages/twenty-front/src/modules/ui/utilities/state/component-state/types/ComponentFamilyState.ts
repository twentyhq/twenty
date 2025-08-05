import { ComponentFamilyStateKey } from '@/ui/utilities/state/component-state/types/ComponentFamilyStateKey';
import { ComponentStateType } from '@/ui/utilities/state/component-state/types/ComponentStateType';
import { RecoilState, SerializableParam } from 'recoil';

export type ComponentFamilyState<
  StateType,
  FamilyKey extends SerializableParam,
> = {
  type: Extract<ComponentStateType, 'ComponentFamilyState'>;
  key: string;
  atomFamily: (
    componentFamilyStateKey: ComponentFamilyStateKey<FamilyKey>,
  ) => RecoilState<StateType>;
};
