import { ComponentFamilyStateKeyV2 } from '@/ui/utilities/state/component-state/types/ComponentFamilyStateKeyV2';
import { ComponentStateTypeV2 } from '@/ui/utilities/state/component-state/types/ComponentStateTypeV2';
import { RecoilState, SerializableParam } from 'recoil';

export type ComponentFamilySelectorV2<
  StateType,
  FamilyKey extends SerializableParam,
> = {
  type: Extract<ComponentStateTypeV2, 'ComponentFamilySelector'>;
  key: string;
  selectorFamily: (
    componentFamilyStateKey: ComponentFamilyStateKeyV2<FamilyKey>,
  ) => RecoilState<StateType>;
};
