import { ComponentFamilyStateKeyV2 } from '@/ui/utilities/state/component-state/types/ComponentFamilyStateKeyV2';
import { ComponentStateTypeV2 } from '@/ui/utilities/state/component-state/types/ComponentStateTypeV2';
import { RecoilValueReadOnly, SerializableParam } from 'recoil';

export type ComponentFamilyReadOnlySelectorV2<
  StateType,
  FamilyKey extends SerializableParam,
> = {
  type: Extract<ComponentStateTypeV2, 'ComponentFamilyReadOnlySelector'>;
  key: string;
  selectorFamily: (
    componentFamilyStateKey: ComponentFamilyStateKeyV2<FamilyKey>,
  ) => RecoilValueReadOnly<StateType>;
};
