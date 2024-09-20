import { ComponentFamilyStateKeyV2 } from '@/ui/utilities/state/component-state/types/ComponentFamilyStateKeyV2';
import { ComponentStateTypeV2 } from '@/ui/utilities/state/component-state/types/ComponentStateTypeV2';
import { RecoilState, SerializableParam } from 'recoil';

export type ComponentFamilyStateV2<
  StateType,
  FamilyKey extends SerializableParam,
> = {
  type: Extract<ComponentStateTypeV2, 'ComponentFamilyState'>;
  key: string;
  atomFamily: (
    componentFamilyStateKey: ComponentFamilyStateKeyV2<FamilyKey>,
  ) => RecoilState<StateType>;
};
