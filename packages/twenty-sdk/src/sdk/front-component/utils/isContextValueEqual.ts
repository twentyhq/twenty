import { isDefined } from 'twenty-shared/utils';

type IsContextValueEqualArgs = {
  previousValue: unknown;
  nextValue: unknown;
};

const isJsonObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== 'object' || !isDefined(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
};

// twenty-shared's fastDeepEqual sits in a non-tree-shakable ~600KB chunk.
export const isContextValueEqual = ({
  previousValue,
  nextValue,
}: IsContextValueEqualArgs): boolean => {
  if (Object.is(previousValue, nextValue)) {
    return true;
  }

  if (Array.isArray(previousValue) && Array.isArray(nextValue)) {
    return (
      previousValue.length === nextValue.length &&
      previousValue.every((item, index) =>
        isContextValueEqual({
          previousValue: item,
          nextValue: nextValue[index],
        }),
      )
    );
  }

  if (!isJsonObject(previousValue) || !isJsonObject(nextValue)) {
    return false;
  }

  const previousKeys = Object.keys(previousValue);

  return (
    previousKeys.length === Object.keys(nextValue).length &&
    previousKeys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(nextValue, key) &&
        isContextValueEqual({
          previousValue: previousValue[key],
          nextValue: nextValue[key],
        }),
    )
  );
};
