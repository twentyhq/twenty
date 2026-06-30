import { isNonEmptyString } from '@sniptt/guards';

const ORDER_DIRECTIONS = new Set([
  'AscNullsFirst',
  'AscNullsLast',
  'DescNullsFirst',
  'DescNullsLast',
]);

export const isOrderByDirection = (value: unknown): value is string =>
  isNonEmptyString(value) && ORDER_DIRECTIONS.has(value);
