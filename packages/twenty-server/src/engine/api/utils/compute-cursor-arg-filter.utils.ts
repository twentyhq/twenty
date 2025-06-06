import {
  ObjectRecordFilter,
  ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { buildWhereCondition } from 'src/engine/api/utils/build-where-condition.utils';
import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';

export const computeCursorArgFilter = (
  cursor: Record<string, unknown>,
  orderBy: ObjectRecordOrderBy,
  fieldMetadataMapByName: FieldMetadataMap,
  isForwardPagination = true,
): ObjectRecordFilter[] => {
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
        ...buildWhereCondition({
          key: cursorKeys[subConditionIndex],
          cursorValue: cursorValues[subConditionIndex],
          fieldMetadataMapByName,
          orderBy,
          isForwardPagination: true,
          operator: 'eq',
        }),
      };
    }

    return {
      ...whereCondition,
      ...buildWhereCondition({
        key,
        cursorValue: value,
        fieldMetadataMapByName,
        orderBy,
        isForwardPagination,
      }),
    } as ObjectRecordFilter;
  });
};
