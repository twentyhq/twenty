import { SerializableParam } from 'recoil';

export type ScopedFamilyStateKey<FamilyKey extends SerializableParam> = {
  scopeId: string;
  familyKey: FamilyKey;
};
