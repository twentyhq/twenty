import { atom, AtomEffect } from 'recoil';

export const createState = <ValueType>({
  key,
  defaultValue,
  effects,
}: {
  key: string;
  defaultValue: ValueType;
  effects?: ReadonlyArray<AtomEffect<ValueType>>;
}) => {
  return () =>
    atom<ValueType>({
      key,
      default: defaultValue,
      effects,
    });
};
