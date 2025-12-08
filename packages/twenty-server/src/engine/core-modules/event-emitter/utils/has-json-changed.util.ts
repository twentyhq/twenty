import { isArray, isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

const fastDeepEqual = (firstValue: unknown, secondValue: unknown): boolean => {
  if (firstValue === secondValue) return true;

  if (!isObject(firstValue) || !isObject(secondValue)) return false;

  if (isArray(firstValue)) {
    if (!isArray(secondValue) || firstValue.length !== secondValue.length) {
      return false;
    }

    for (let index = 0; index < firstValue.length; index++) {
      if (!fastDeepEqual(firstValue[index], secondValue[index])) return false;
    }

    return true;
  }

  if (isArray(secondValue)) return false;

  const firstKeys = Object.keys(firstValue);
  const secondKeys = Object.keys(secondValue);

  if (firstKeys.length !== secondKeys.length) return false;

  for (const key of firstKeys) {
    if (
      !(key in secondValue) ||
      !fastDeepEqual(
        firstValue[key as keyof typeof firstValue],
        secondValue[key as keyof typeof secondValue],
      )
    ) {
      return false;
    }
  }

  return true;
};

export const hasJsonChanged = (
  oldValue: unknown,
  newValue: unknown,
): boolean => {
  if (!isDefined(oldValue)) return isDefined(newValue);
  if (!isDefined(newValue)) return isDefined(oldValue);

  return !fastDeepEqual(oldValue, newValue);
};
