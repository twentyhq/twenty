import { InstanceFamilyStateKey } from '@/ui/utilities/state/instance/types/InstanceFamilyStateKey';
import { RecoilState, SerializableParam } from 'recoil';

export type InstanceFamilyState<
  StateType,
  FamilyKey extends SerializableParam,
> = {
  key: string;
  atomFamily: (
    instanceFamilyStateKey: InstanceFamilyStateKey<FamilyKey>,
  ) => RecoilState<StateType>;
};
