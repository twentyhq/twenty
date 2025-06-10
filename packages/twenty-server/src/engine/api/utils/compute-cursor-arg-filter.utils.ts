import {
  ObjectRecordFilter,
  ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { buildCumulativeConditions } from 'src/engine/api/utils/build-cumulative-conditions.utils';
import { buildWhereCondition } from 'src/engine/api/utils/build-where-condition.utils';
import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';

export const computeCursorArgFilter = (
  cursor: Record<string, unknown>,
  orderBy: ObjectRecordOrderBy,
  fieldMetadataMapByName: FieldMetadataMap,
  isForwardPagination = true,
): ObjectRecordFilter[] => {
  const cursorEntries = Object.entries(cursor ?? {});

  if (cursorEntries.length === 0) {
    return [];
  }

  return buildCumulativeConditions({
    items: cursorEntries,
    buildEqualityCondition: ([key, value]) =>
      buildWhereCondition({
        key,
        cursorValue: value,
        fieldMetadataMapByName,
        orderBy,
        isForwardPagination: true,
        operator: 'eq',
      }),
    buildMainCondition: ([key, value]) =>
      buildWhereCondition({
        key,
        cursorValue: value,
        fieldMetadataMapByName,
        orderBy,
        isForwardPagination,
      }),
  });
};
