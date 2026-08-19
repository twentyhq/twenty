import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { isPlainObject } from 'twenty-shared/utils';

import {
  type ObjectRecordCursor,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { resolveOrderByFields } from 'src/engine/api/utils/resolve-order-by-fields.utils';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const throwCursorOrderByMismatch = (fieldName: string): never => {
  throw new GraphqlQueryRunnerException(
    `Cursor is missing the value for orderBy field "${fieldName}": it was encoded for a different orderBy. Restart pagination without a cursor.`,
    GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
    { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
  );
};

// A keyset cursor can only continue the scan if it carries a value for every key
// of the requested ordering. A cursor generated under another orderBy (or by a
// version that failed to capture the sort value) must fail loudly: continuing on
// the remaining keys silently skips records (issue #24333).
export const validateCursorMatchesOrderByOrThrow = ({
  cursor,
  orderBy,
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  cursor: ObjectRecordCursor;
  orderBy: ObjectRecordOrderBy;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): void => {
  for (const {
    fieldName,
    orderByValue,
    fieldMetadata,
    isAccessedByFieldName,
  } of resolveOrderByFields({
    orderBy,
    flatObjectMetadata,
    flatFieldMetadataMaps,
  })) {
    if (
      isAccessedByFieldName &&
      isMorphOrRelationFlatFieldMetadata(fieldMetadata) &&
      isPlainObject(orderByValue)
    ) {
      const relationCursorValue = cursor[fieldName];

      for (const subFieldKey of Object.keys(
        orderByValue as Record<string, unknown>,
      )) {
        if (
          !isPlainObject(relationCursorValue) ||
          (relationCursorValue as Record<string, unknown>)[subFieldKey] ===
            undefined
        ) {
          throw new GraphqlQueryRunnerException(
            `Cursor is missing the value for orderBy field "${fieldName}.${subFieldKey}": include the ordered relation field in the selection (e.g. "${fieldName} { ${subFieldKey} }") so cursors can carry it`,
            GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
            { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
          );
        }
      }
      continue;
    }

    if (
      isAccessedByFieldName &&
      isCompositeFieldMetadataType(fieldMetadata.type) &&
      isPlainObject(orderByValue)
    ) {
      const compositeType = compositeTypeDefinitions.get(
        fieldMetadata.type as CompositeFieldMetadataType,
      );
      const compositeCursorValue = cursor[fieldName];

      for (const subFieldKey of Object.keys(
        orderByValue as Record<string, unknown>,
      )) {
        const property = compositeType?.properties.find(
          (compositeProperty) => compositeProperty.name === subFieldKey,
        );

        if (property?.type === FieldMetadataType.RAW_JSON) {
          continue;
        }

        const hasNestedValue =
          isPlainObject(compositeCursorValue) &&
          (compositeCursorValue as Record<string, unknown>)[subFieldKey] !==
            undefined;
        // Legacy cursors carried composite values under dotted keys
        const hasDottedValue =
          cursor[`${fieldName}.${subFieldKey}`] !== undefined;

        if (!hasNestedValue && !hasDottedValue) {
          throwCursorOrderByMismatch(`${fieldName}.${subFieldKey}`);
        }
      }
      continue;
    }

    if (cursor[fieldName] === undefined) {
      throwCursorOrderByMismatch(fieldName);
    }
  }
};
