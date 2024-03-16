import { atomFamily, SerializableParam } from 'recoil';

export const createFamilyState = <
  ValueType,
  FamilyKey extends SerializableParam,
>({
  key,
  defaultValue,
}: {
  key: string;
  defaultValue: ValueType;
}) => {
  return atomFamily<ValueType, FamilyKey>({
    key,
    default: defaultValue,
  });
};
