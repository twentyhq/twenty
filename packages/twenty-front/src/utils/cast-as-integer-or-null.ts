/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { isNull, isNumber, isString } from '@sniptt/guards';

import { logError } from './logError';

const DEBUG_MODE = false;

export const canBeCastAsIntegerOrNull = (
  probableNumberOrNull: string | undefined | number | null,
): probableNumberOrNull is number | null => {
  if (probableNumberOrNull === undefined) {
    if (DEBUG_MODE) logError('probableNumberOrNull === undefined');

    return false;
  }

  if (isNumber(probableNumberOrNull)) {
    if (DEBUG_MODE) logError('typeof probableNumberOrNull === "number"');

    return Number.isInteger(probableNumberOrNull);
  }

  if (isNull(probableNumberOrNull)) {
    if (DEBUG_MODE) logError('probableNumberOrNull === null');

    return true;
  }

  if (probableNumberOrNull === '') {
    if (DEBUG_MODE) logError('probableNumberOrNull === ""');

    return true;
  }

  if (isString(probableNumberOrNull)) {
    const stringAsNumber = +probableNumberOrNull;

    if (isNaN(stringAsNumber)) {
      if (DEBUG_MODE) logError('isNaN(stringAsNumber)');

      return false;
    }
    if (Number.isInteger(stringAsNumber)) {
      if (DEBUG_MODE) logError('Number.isInteger(stringAsNumber)');

      return true;
    }
  }

  return false;
};

export const castAsIntegerOrNull = (
  probableNumberOrNull: string | undefined | number | null,
): number | null => {
  if (canBeCastAsIntegerOrNull(probableNumberOrNull) === false) {
    throw new Error('Cannot cast to number or null');
  }

  if (isNull(probableNumberOrNull)) {
    return null;
  }

  if (isString(probableNumberOrNull)) {
    if (probableNumberOrNull === '') {
      return null;
    }
    return +probableNumberOrNull;
  }

  if (isNumber(probableNumberOrNull)) {
    return probableNumberOrNull;
  }

  return null;
};
