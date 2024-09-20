import {
  OrderByDirection,
  RecordFilter,
  RecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';

export const computeCursorArgFilter = (
  cursor: Record<string, any>,
  orderBy: RecordOrderBy,
  isForwardPagination = true,
): RecordFilter[] => {
  const cursorKeys = Object.keys(cursor ?? {});
  const cursorValues = Object.values(cursor ?? {});

  if (cursorKeys.length === 0) {
    return [];
  }

  return Object.entries(cursor ?? {}).map(([key, value], index) => {
    let whereCondition = {};

    for (
      let subConditionIndex = 0;
      subConditionIndex < index;
      subConditionIndex++
    ) {
      whereCondition = {
        ...whereCondition,
        [cursorKeys[subConditionIndex]]: {
          eq: cursorValues[subConditionIndex],
        },
      };
    }

    const keyOrderBy = orderBy.find((order) => key in order);

    if (!keyOrderBy) {
      throw new GraphqlQueryRunnerException(
        'Invalid cursor',
        GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
      );
    }

    const isAscending =
      keyOrderBy[key] === OrderByDirection.AscNullsFirst ||
      keyOrderBy[key] === OrderByDirection.AscNullsLast;

    const operator = isAscending
      ? isForwardPagination
        ? 'gt'
        : 'lt'
      : isForwardPagination
        ? 'lt'
        : 'gt';

    return {
      ...whereCondition,
      ...{ [key]: { [operator]: value } },
    } as RecordFilter;
  });
};
