import { RecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';

export const computeCursorArgFilter = (
  cursor: Record<string, any>,
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

    return {
      ...whereCondition,
      ...{ [key]: isForwardPagination ? { gt: value } : { lt: value } },
    } as RecordFilter;
  });
};
