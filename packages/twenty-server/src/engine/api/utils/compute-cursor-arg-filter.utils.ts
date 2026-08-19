import { isDefined } from 'twenty-shared/utils';

import {
  type ObjectRecordCursor,
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { buildCursorLeafWhereCondition } from 'src/engine/api/utils/build-cursor-leaf-where-condition.utils';
import {
  checkIfLeafCanCarryCursorValue,
  getCursorValueForLeaf,
  resolveOrderByLeaves,
} from 'src/engine/api/utils/resolve-order-by-leaves.utils';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type ComputeCursorArgFilterParams = {
  cursor: ObjectRecordCursor;
  orderBy: ObjectRecordOrderBy;
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  isForwardPagination: boolean;
};

// Builds the cumulative keyset conditions continuing a scan from a cursor:
// (k1 after v1) OR (k1 = v1 AND k2 after v2) OR ... over the ordered leaves.
// A keyset cursor can only continue the scan if it carries a value for every
// leaf of the requested ordering: a cursor generated under another orderBy (or
// by a version that failed to capture a sort value) must fail loudly, because
// continuing on the remaining leaves silently skips records (issue #24333).
export const computeCursorArgFilter = ({
  cursor,
  orderBy,
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  isForwardPagination,
}: ComputeCursorArgFilterParams): ObjectRecordFilter[] => {
  const leaves = resolveOrderByLeaves({
    orderBy,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    strictValidation: true,
  }).filter(checkIfLeafCanCarryCursorValue);

  const leavesWithCursorValues = leaves.map((leaf) => {
    const cursorValue = getCursorValueForLeaf(cursor, leaf);

    if (cursorValue === undefined) {
      throw new GraphqlQueryRunnerException(
        `Cursor is missing the value for orderBy field "${leaf.path.join('.')}": it was encoded for a different orderBy. Restart pagination without a cursor.`,
        GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    return { leaf, cursorValue };
  });

  // Each equality condition is reused by every later branch: compute them once
  const equalityConditions = leavesWithCursorValues.map(
    ({ leaf, cursorValue }) =>
      buildCursorLeafWhereCondition({
        leaf,
        cursorValue,
        isForwardPagination,
        isEqualityCondition: true,
      }),
  );

  return leavesWithCursorValues.flatMap(({ leaf, cursorValue }, index) => {
    const mainCondition = buildCursorLeafWhereCondition({
      leaf,
      cursorValue,
      isForwardPagination,
      isEqualityCondition: false,
    });

    // A null main condition means no row can sort strictly after the cursor on
    // this leaf alone (e.g. inside a trailing NULL block): only the tie-breaking
    // leaves of the following branches can advance the scan
    if (!isDefined(mainCondition)) {
      return [];
    }

    const andConditions = [
      ...equalityConditions.slice(0, index),
      mainCondition,
    ] as ObjectRecordFilter[];

    if (andConditions.length === 1) {
      return [andConditions[0]];
    }

    return [{ and: andConditions } as unknown as ObjectRecordFilter];
  });
};
