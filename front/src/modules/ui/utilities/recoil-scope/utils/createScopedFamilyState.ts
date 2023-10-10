import { atomFamily, SerializableParam } from 'recoil';

import { ScopedFamilyStateKey } from '../scopes-internal/types/ScopedFamilyStateKey';

export const createScopedFamilyState = <
  ValueType,
  FamilyKey extends SerializableParam,
>({
  key,
  defaultValue,
}: {
  key: string;
  defaultValue: ValueType;
}) => {
  return atomFamily<ValueType, ScopedFamilyStateKey<FamilyKey>>({
    key,
    default: defaultValue,
  });
};
