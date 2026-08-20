import { OrderByDirection } from 'twenty-shared/types';

import { convertOrderByToFindOptionsOrder } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/convert-order-by-to-find-options-order';

describe('convertOrderByToFindOptionsOrder', () => {
  it.each([
    [OrderByDirection.AscNullsFirst, 'ASC', 'NULLS FIRST'],
    [OrderByDirection.AscNullsLast, 'ASC', 'NULLS LAST'],
    [OrderByDirection.DescNullsFirst, 'DESC', 'NULLS FIRST'],
    [OrderByDirection.DescNullsLast, 'DESC', 'NULLS LAST'],
  ])(
    'should keep %s as-is for forward pagination',
    (direction, order, nulls) => {
      expect(convertOrderByToFindOptionsOrder(direction, true)).toEqual({
        order,
        nulls,
      });
    },
  );

  // The backward scan is the exact reverse of the requested order, so the NULLS
  // placement reverses along with the direction
  it.each([
    [OrderByDirection.AscNullsFirst, 'DESC', 'NULLS LAST'],
    [OrderByDirection.AscNullsLast, 'DESC', 'NULLS FIRST'],
    [OrderByDirection.DescNullsFirst, 'ASC', 'NULLS LAST'],
    [OrderByDirection.DescNullsLast, 'ASC', 'NULLS FIRST'],
  ])(
    'should fully reverse %s for backward pagination',
    (direction, order, nulls) => {
      expect(convertOrderByToFindOptionsOrder(direction, false)).toEqual({
        order,
        nulls,
      });
    },
  );
});
