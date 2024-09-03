import { InstanceStateKey } from '@/ui/utilities/state/instance/types/InstanceStateKey';
import { SerializableParam } from 'recoil';

export type InstanceFamilyStateKey<FamilyKey extends SerializableParam> =
  InstanceStateKey & {
    familyKey: FamilyKey;
  };
