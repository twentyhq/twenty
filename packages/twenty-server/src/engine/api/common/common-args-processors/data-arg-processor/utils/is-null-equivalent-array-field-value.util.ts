import { isEmptyObject } from "twenty-shared/utils";

export const isNullEquivalentArrayFieldValue = (value: unknown): boolean => {
  return (
    value === null ||
    (Array.isArray(value) &&
      (value.length === 0 ||
        value.every((item) => isNullEquivalentArrayFieldValue(item)))) ||
    isEmptyObject(value)
  );
};
