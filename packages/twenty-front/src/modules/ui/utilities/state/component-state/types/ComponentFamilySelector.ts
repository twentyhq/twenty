import { type ComponentFamilyStateKey } from '@/ui/utilities/state/component-state/types/ComponentFamilyStateKey';
import { type ComponentStateType } from '@/ui/utilities/state/component-state/types/ComponentStateType';
import { type RecoilState, type SerializableParam } from 'recoil';

export type ComponentFamilySelector<
  StateType,
  FamilyKey extends SerializableParam,
> = {
  type: Extract<ComponentStateType, 'ComponentFamilySelector'>;
  key: string;
  selectorFamily: (
    componentFamilyStateKey: ComponentFamilyStateKey<FamilyKey>,
  ) => RecoilState<StateType>;
};
