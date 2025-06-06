import {
  ObjectRecordFilter,
  ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { buildWhereCondition } from 'src/engine/api/utils/build-where-condition.utils';
import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';

export const computeCursorArgFilter = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cursor: Record<string, any>,
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
        ...buildWhereCondition(
          cursorKeys[subConditionIndex],
          cursorValues[subConditionIndex],
          fieldMetadataMapByName,
          orderBy,
          isForwardPagination,
          'eq',
        ),
      };
    }

    return {
      ...whereCondition,
      ...buildWhereCondition(
        key,
        value,
        fieldMetadataMapByName,
        orderBy,
        isForwardPagination,
      ),
    } as ObjectRecordFilter;
  });
};
