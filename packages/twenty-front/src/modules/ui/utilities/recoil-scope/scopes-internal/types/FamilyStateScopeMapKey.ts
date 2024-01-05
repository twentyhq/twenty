import { SerializableParam } from 'recoil';

export type FamilyStateScopeMapKey<FamilyKey extends SerializableParam> = {
  scopeId: string;
  familyKey: FamilyKey;
};
