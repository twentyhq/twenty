import { isDefined } from 'twenty-shared/utils';

import {
  ObjectRecordCursor,
  ObjectRecordCursorLeafCompositeValue,
  ObjectRecordCursorLeafScalarValue,
  ObjectRecordFilter,
  ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { buildCumulativeConditions } from 'src/engine/api/utils/build-cumulative-conditions.utils';
import { buildWhereCondition } from 'src/engine/api/utils/build-where-condition.utils';
import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';

export const computeCursorArgFilter = (
  cursor: ObjectRecordCursor,
  orderBy: ObjectRecordOrderBy,
  fieldMetadataMapByName: FieldMetadataMap,
  isForwardPagination = true,
): ObjectRecordFilter[] => {
  const cursorEntries = Object.entries(cursor)
    .map(([key, value]) => {
      if (value === undefined) {
        return null;
      }

      return {
        [key]: value,
      };
    })
    .filter(isDefined);

  if (cursorEntries.length === 0) {
    return [];
  }

  return buildCumulativeConditions<
    ObjectRecordCursorLeafCompositeValue | ObjectRecordCursorLeafScalarValue
  >({
    items: cursorEntries,
    buildEqualityCondition: ({ cursorKey, cursorValue }) =>
      buildWhereCondition({
        cursorKey,
        cursorValue,
        fieldMetadataMapByName,
        orderBy,
        isForwardPagination: true,
        operator: 'eq',
      }),
    buildMainCondition: ({ cursorKey, cursorValue }) =>
      buildWhereCondition({
        cursorKey,
        cursorValue,
        fieldMetadataMapByName,
        orderBy,
        isForwardPagination,
      }),
  });
};
