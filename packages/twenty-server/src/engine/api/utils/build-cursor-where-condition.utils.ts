import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  type ObjectRecordCursorLeafCompositeValue,
  type ObjectRecordCursorLeafScalarValue,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { resolveFilterKeyFieldMetadata } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/utils/resolve-filter-key-field-metadata.util';
import { buildCursorCompositeFieldWhereCondition } from 'src/engine/api/utils/build-cursor-composite-field-where-condition.utils';
import { buildCursorRelationFieldWhereCondition } from 'src/engine/api/utils/build-cursor-relation-field-where-condition.utils';
import {
  buildCursorKeysetCondition,
  checkIfColumnHasNullEquivalentDefault,
} from 'src/engine/api/utils/build-cursor-keyset-condition.utils';
import { validateAndGetOrderByForScalarField } from 'src/engine/api/utils/validate-and-get-order-by.utils';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type BuildCursorWhereConditionParams = {
  cursorKey: string;
  cursorValue:
    | ObjectRecordCursorLeafScalarValue
    | ObjectRecordCursorLeafCompositeValue;
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  orderBy: ObjectRecordOrderBy;
  isForwardPagination: boolean;
  isEqualityCondition?: boolean;
};

// Returns null when no row can sort strictly after the cursor on this key alone
// (e.g. the cursor sits inside the trailing NULL block): the caller must then
// rely on the tie-breaking keys and drop this or-branch entirely.
export const buildCursorWhereCondition = ({
  cursorKey,
  cursorValue,
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  orderBy,
  isForwardPagination,
  isEqualityCondition = false,
}: BuildCursorWhereConditionParams): Record<string, unknown> | null => {
  const { fieldIdByName, fieldIdByJoinColumnName } =
    buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

  const [fieldKey, ...subFieldPath] = cursorKey.split('.');
  const compositeSubFieldKey = subFieldPath.join('.');
  const fieldMetadataKey = fieldKey as keyof ObjectRecord;
  const { fieldMetadata, isReferencedByFieldName } =
    resolveFilterKeyFieldMetadata({
    filterKey: fieldKey,
    fieldIdByName,
    fieldIdByJoinColumnName,
    flatFieldMetadataMaps,
  });

  if (!fieldMetadata) {
    throw new GraphqlQueryRunnerException(
      `Field metadata not found for key: ${String(cursorKey)}`,
      GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if (
    isReferencedByFieldName &&
    isMorphOrRelationFlatFieldMetadata(fieldMetadata)
  ) {
    return buildCursorRelationFieldWhereCondition({
      relationFieldMetadata: fieldMetadata,
      cursorValue,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      orderBy,
      isForwardPagination,
      isEqualityCondition,
    });
  }

  if (isCompositeFieldMetadataType(fieldMetadata.type)) {
    return buildCursorCompositeFieldWhereCondition({
      fieldType: fieldMetadata.type,
      fieldKey: fieldMetadataKey,
      orderBy,
      // Legacy cursors carried composite values under dotted keys
      cursorValue: (compositeSubFieldKey.length > 0
        ? { [compositeSubFieldKey]: cursorValue }
        : cursorValue) as ObjectRecordCursorLeafCompositeValue,
      isForwardPagination,
      isEqualityCondition,
    });
  }

  const keyOrderBy = validateAndGetOrderByForScalarField(
    fieldMetadataKey,
    orderBy,
  );
  const orderByDirection = keyOrderBy[fieldMetadataKey];

  if (!isDefined(orderByDirection)) {
    throw new GraphqlQueryRunnerException(
      'Invalid cursor',
      GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  return buildCursorKeysetCondition({
    cursorValue,
    orderByDirection,
    isForwardPagination,
    isEqualityCondition,
    canFieldHoldNullValue:
      fieldMetadata.isNullable !== false &&
      !checkIfColumnHasNullEquivalentDefault(fieldMetadata.type),
    buildLeafCondition: (leafFilter) => ({ [fieldMetadataKey]: leafFilter }),
  });
};
