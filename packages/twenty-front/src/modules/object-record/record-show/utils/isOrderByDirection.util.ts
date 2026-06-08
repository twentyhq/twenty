const ORDER_DIRECTIONS = new Set([
  'AscNullsFirst',
  'AscNullsLast',
  'DescNullsFirst',
  'DescNullsLast',
]);

export const isOrderByDirection = (value: unknown): value is string =>
  typeof value === 'string' && ORDER_DIRECTIONS.has(value);
