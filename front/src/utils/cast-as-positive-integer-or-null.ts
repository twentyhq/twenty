export const canBeCastAsPositiveIntegerOrNull = (
  probablePositiveNumberOrNull: string | undefined | number | null,
): probablePositiveNumberOrNull is number | null => {
  if (probablePositiveNumberOrNull === undefined) {
    return false;
  }

  if (typeof probablePositiveNumberOrNull === 'number') {
    return (
      Number.isInteger(probablePositiveNumberOrNull) &&
      Math.sign(probablePositiveNumberOrNull) !== -1
    );
  }

  if (probablePositiveNumberOrNull === null) {
    return true;
  }

  if (probablePositiveNumberOrNull === '') {
    return true;
  }

  if (typeof probablePositiveNumberOrNull === 'string') {
    const stringAsNumber = +probablePositiveNumberOrNull;

    if (isNaN(stringAsNumber)) {
      return false;
    }

    if (Number.isInteger(stringAsNumber) && Math.sign(stringAsNumber) !== -1) {
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

  if (probablePositiveNumberOrNull === '') {
    return null;
  }

  if (typeof probablePositiveNumberOrNull === 'number') {
    return probablePositiveNumberOrNull;
  }

  if (typeof probablePositiveNumberOrNull === 'string') {
    return +probablePositiveNumberOrNull;
  }

  return null;
};
