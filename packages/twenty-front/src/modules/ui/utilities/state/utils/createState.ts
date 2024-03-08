import { atom } from 'recoil';

export const createState = <ValueType>({
  key,
  defaultValue,
}: {
  key: string;
  defaultValue: ValueType;
}) => {
  return () =>
    atom<ValueType>({
      key,
      default: defaultValue,
    });
};
