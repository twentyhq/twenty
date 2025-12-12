import { OrderByDirection } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';
import { GraphOrderBy } from '~/generated/graphql';

export const mapOrderByToDirection = (
  orderByEnum: GraphOrderBy,
): OrderByDirection => {
  switch (orderByEnum) {
    case GraphOrderBy.FIELD_ASC:
    case GraphOrderBy.MANUAL:
      return OrderByDirection.AscNullsLast;
    case GraphOrderBy.FIELD_DESC:
      return OrderByDirection.DescNullsLast;
    case GraphOrderBy.VALUE_ASC:
      return OrderByDirection.AscNullsLast;
    case GraphOrderBy.VALUE_DESC:
      return OrderByDirection.DescNullsLast;
    default:
      assertUnreachable(orderByEnum);
  }
};
