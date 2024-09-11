import { ComponentFamilyStateKeyV2 } from '@/ui/utilities/state/instance/types/ComponentFamilyStateKeyV2';
import { RecoilState, SerializableParam } from 'recoil';

export type ComponentFamilyStateV2<
  StateType,
  FamilyKey extends SerializableParam,
> = {
  key: string;
  atomFamily: (
    componentFamilyStateKey: ComponentFamilyStateKeyV2<FamilyKey>,
  ) => RecoilState<StateType>;
};
