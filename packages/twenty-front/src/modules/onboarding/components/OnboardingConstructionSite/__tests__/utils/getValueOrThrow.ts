import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

export const getValueOrThrow = (values: ArrayLike<number>, index: number) => {
  const value = values[index];
  assertIsDefinedOrThrow(value);
  return value;
};
