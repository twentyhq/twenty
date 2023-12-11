import { atomFamily } from 'recoil';

export const createScopedState = <ValueType>({
  key,
  defaultValue,
}: {
  key: string;
  defaultValue: ValueType;
}) => {
  return atomFamily<ValueType, { scopeId: string }>({
    key,
    default: defaultValue,
  });
};
