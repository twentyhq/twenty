import { isDefined } from 'twenty-shared/utils';

export const isSafeCoordinate = (value: number, fallback: number): number => {
  return isDefined(value) && Number.isFinite(value) && !Number.isNaN(value)
    ? value
    : fallback;
};
