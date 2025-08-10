import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { type SerializableParam } from 'recoil';

export type ComponentFamilyStateKey<FamilyKey extends SerializableParam> =
  ComponentStateKey & {
    familyKey: FamilyKey;
  };
