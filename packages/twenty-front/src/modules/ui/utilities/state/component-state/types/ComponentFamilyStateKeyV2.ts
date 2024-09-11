import { ComponentStateKeyV2 } from '@/ui/utilities/state/instance/types/ComponentStateKeyV2';
import { SerializableParam } from 'recoil';

export type ComponentFamilyStateKeyV2<FamilyKey extends SerializableParam> =
  ComponentStateKeyV2 & {
    familyKey: FamilyKey;
  };
