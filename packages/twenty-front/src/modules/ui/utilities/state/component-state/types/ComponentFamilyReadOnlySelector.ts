import { type ComponentFamilyStateKey } from '@/ui/utilities/state/component-state/types/ComponentFamilyStateKey';
import { type ComponentStateType } from '@/ui/utilities/state/component-state/types/ComponentStateType';
import { type RecoilValueReadOnly, type SerializableParam } from 'recoil';

export type ComponentFamilyReadOnlySelector<
  StateType,
  FamilyKey extends SerializableParam,
> = {
  type: Extract<ComponentStateType, 'ComponentFamilyReadOnlySelector'>;
  key: string;
  selectorFamily: (
    componentFamilyStateKey: ComponentFamilyStateKey<FamilyKey>,
  ) => RecoilValueReadOnly<StateType>;
};
