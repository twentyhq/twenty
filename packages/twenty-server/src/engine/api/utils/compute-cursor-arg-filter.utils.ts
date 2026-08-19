import { isDefined } from 'twenty-shared/utils';

import {
  type ObjectRecordCursor,
  type ObjectRecordCursorLeafCompositeValue,
  type ObjectRecordCursorLeafScalarValue,
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { buildCursorCumulativeWhereCondition } from 'src/engine/api/utils/build-cursor-cumulative-where-conditions.utils';
import { buildCursorWhereCondition } from 'src/engine/api/utils/build-cursor-where-condition.utils';
import { validateCursorMatchesOrderByOrThrow } from 'src/engine/api/utils/validate-cursor-matches-order-by.utils';
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
  validateCursorMatchesOrderByOrThrow({
    cursor,
    orderBy,
    flatObjectMetadata,
    flatFieldMetadataMaps,
  });

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
    buildEqualityCondition: ({ cursorKey, cursorValue }) => {
      const equalityCondition = buildCursorWhereCondition({
        cursorKey,
        cursorValue,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        orderBy,
        isForwardPagination: true,
        isEqualityCondition: true,
      });

      // Equality conditions always exist: only strictly-after conditions can
      // degenerate to null inside a trailing NULL block
      if (!isDefined(equalityCondition)) {
        throw new GraphqlQueryRunnerException(
          `Invalid cursor: no equality condition for key "${cursorKey}"`,
          GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
          { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
        );
      }

      return equalityCondition;
    },
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
