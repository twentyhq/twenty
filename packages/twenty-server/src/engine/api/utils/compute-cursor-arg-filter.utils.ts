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
import { validateCursorMatchesOrderByOrThrow } from 'src/engine/api/utils/validate-cursor-matches-order-by.utils';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const computeCursorArgFilter = (
  cursor: ObjectRecordCursor,
  orderBy: ObjectRecordOrderBy,
  flatObjectMetadata: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  isForwardPagination = true,
): ObjectRecordFilter[] => {
  validateCursorMatchesOrderByOrThrow({
    cursor,
    orderBy,
    flatObjectMetadata,
    flatFieldMetadataMaps,
  });

  const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
    flatFieldMetadataMaps,
    flatObjectMetadata,
  );

  const cursorEntries = Object.entries(cursor)
    .map(([key, value]) => {
      if (value === undefined) {
        return null;
      }

      const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldIdByName[key],
        flatEntityMaps: flatFieldMetadataMaps,
      });

      // Legacy cursors embedded whole related records for relation orderBy;
      // those entries cannot produce a keyset condition on the root table
      if (
        isDefined(fieldMetadata) &&
        isMorphOrRelationFlatFieldMetadata(fieldMetadata)
      ) {
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
      }) as ObjectRecordFilter,
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
