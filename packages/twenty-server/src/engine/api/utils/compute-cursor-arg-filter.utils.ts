import { isDefined } from 'twenty-shared/utils';

import {
  ObjectRecordCursor,
  ObjectRecordCursorLeafCompositeValue,
  ObjectRecordCursorLeafScalarValue,
  ObjectRecordFilter,
  ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { buildCursorCumulativeWhereCondition } from 'src/engine/api/utils/build-cursor-cumulative-where-conditions.utils';
import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';
import { buildCursorWhereCondition } from 'src/engine/api/utils/build-cursor-where-condition.utils';

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

  return buildCursorCumulativeWhereCondition<
    ObjectRecordCursorLeafCompositeValue | ObjectRecordCursorLeafScalarValue
  >({
    cursorEntries,
    buildEqualityCondition: ({ cursorKey, cursorValue }) =>
      buildCursorWhereCondition({
        cursorKey,
        cursorValue,
        fieldMetadataMapByName,
        orderBy,
        isForwardPagination: true,
        isEqualityCondition: true,
      }),
    buildMainCondition: ({ cursorKey, cursorValue }) =>
      buildCursorWhereCondition({
        cursorKey,
        cursorValue,
        fieldMetadataMapByName,
        orderBy,
        isForwardPagination,
      }),
  });
};
