import { ComponentFamilyStateKey } from '@/ui/utilities/state/component-state/types/ComponentFamilyStateKey';
import { ComponentStateType } from '@/ui/utilities/state/component-state/types/ComponentStateType';
import { RecoilValueReadOnly, SerializableParam } from 'recoil';

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
