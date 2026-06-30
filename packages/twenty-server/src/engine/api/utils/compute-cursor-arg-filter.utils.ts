import { isDefined } from 'twenty-shared/utils';

import {
  type ObjectRecordCursor,
  type ObjectRecordCursorLeafCompositeValue,
  type ObjectRecordCursorLeafScalarValue,
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { buildCursorCumulativeWhereCondition } from 'src/engine/api/utils/build-cursor-cumulative-where-conditions.utils';
import { buildCursorWhereCondition } from 'src/engine/api/utils/build-cursor-where-condition.utils';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const computeCursorArgFilter = (
  cursor: ObjectRecordCursor,
  orderBy: ObjectRecordOrderBy,
  flatObjectMetadata: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
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
        flatObjectMetadata,
        flatFieldMetadataMaps,
        orderBy,
        isForwardPagination: true,
        isEqualityCondition: true,
      }),
    buildMainCondition: ({ cursorKey, cursorValue }) =>
      buildCursorWhereCondition({
        cursorKey,
        cursorValue,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        orderBy,
        isForwardPagination,
      }),
  });
};
