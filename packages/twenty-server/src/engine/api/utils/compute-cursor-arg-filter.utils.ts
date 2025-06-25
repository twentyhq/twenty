import { isDefined } from 'twenty-shared/utils';

import {
  ObjectRecordCursor,
  ObjectRecordCursorLeafCompositeValue,
  ObjectRecordCursorLeafScalarValue,
  ObjectRecordFilter,
  ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { buildCursorCumulativeWhereCondition } from 'src/engine/api/utils/build-cursor-cumulative-where-conditions.utils';
import { buildCursorWhereCondition } from 'src/engine/api/utils/build-cursor-where-condition.utils';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export const computeCursorArgFilter = (
  cursor: ObjectRecordCursor,
  orderBy: ObjectRecordOrderBy,
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
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
        objectMetadataItemWithFieldMaps,
        orderBy,
        isForwardPagination: true,
        isEqualityCondition: true,
      }),
    buildMainCondition: ({ cursorKey, cursorValue }) =>
      buildCursorWhereCondition({
        cursorKey,
        cursorValue,
        objectMetadataItemWithFieldMaps,
        orderBy,
        isForwardPagination,
      }),
  });
};
