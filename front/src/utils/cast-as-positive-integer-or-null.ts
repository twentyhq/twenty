import { isInteger, isNull, isNumber, isString } from '@sniptt/guards';

export const canBeCastAsPositiveIntegerOrNull = (
  probablePositiveNumberOrNull: string | undefined | number | null,
): probablePositiveNumberOrNull is number | null => {
  if (probablePositiveNumberOrNull === undefined) {
    return false;
  }

  if (isNumber(probablePositiveNumberOrNull)) {
    return (
      Number.isInteger(probablePositiveNumberOrNull) &&
      Math.sign(probablePositiveNumberOrNull) !== -1
    );
  }

  if (isNull(probablePositiveNumberOrNull)) {
    return true;
  }

  if (probablePositiveNumberOrNull === '') {
    return true;
  }

  if (isString(probablePositiveNumberOrNull)) {
    const stringAsNumber = +probablePositiveNumberOrNull;

    if (isNaN(stringAsNumber)) {
      return false;
    }

    if (isInteger(stringAsNumber) && Math.sign(stringAsNumber) !== -1) {
      return true;
    }
  }

  return false;
};

export const castAsPositiveIntegerOrNull = (
  probablePositiveNumberOrNull: string | undefined | number | null,
): number | null => {
  if (
    canBeCastAsPositiveIntegerOrNull(probablePositiveNumberOrNull) === false
  ) {
    throw new Error('Cannot cast to positive number or null');
  }

  if (probablePositiveNumberOrNull === null) {
    return null;
  }

  if (isString(probablePositiveNumberOrNull)) {
    if (probablePositiveNumberOrNull === '') {
      return null;
    }
    return +probablePositiveNumberOrNull;
  }

  if (isNumber(probablePositiveNumberOrNull)) {
    return probablePositiveNumberOrNull;
  }

  return null;
};
