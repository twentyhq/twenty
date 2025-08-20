import { type AtomEffect, atomFamily, type SerializableParam } from 'recoil';

export const createFamilyState = <
  ValueType,
  FamilyKey extends SerializableParam,
>({
  key,
  defaultValue,
  effects,
}: {
  key: string;
  defaultValue: ValueType;
  effects?: ReadonlyArray<AtomEffect<ValueType>>;
}) => {
  return atomFamily<ValueType, FamilyKey>({
    key,
    default: defaultValue,
    effects,
  });
};
