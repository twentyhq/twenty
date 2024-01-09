import { atomFamily, SerializableParam } from 'recoil';

import { FamilyStateScopeMapKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/FamilyStateScopeMapKey';

export const createFamilyStateScopeMap = <
  ValueType,
  FamilyKey extends SerializableParam,
>({
  key,
  defaultValue,
}: {
  key: string;
  defaultValue: ValueType;
}) => {
  return atomFamily<ValueType, FamilyStateScopeMapKey<FamilyKey>>({
    key,
    default: defaultValue,
  });
};
