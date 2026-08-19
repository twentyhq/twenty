import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import {
  type ObjectRecordCursor,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
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
  const { fieldIdByName, fieldIdByJoinColumnName } =
    buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

  for (const orderByEntry of orderBy) {
    for (const [fieldName, orderByValue] of Object.entries(orderByEntry)) {
      const isAccessedByFieldName = isDefined(fieldIdByName[fieldName]);
      const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId:
          fieldIdByName[fieldName] ?? fieldIdByJoinColumnName[fieldName],
        flatEntityMaps: flatFieldMetadataMaps,
      });

      // Unknown fields are rejected by the orderBy parser with a dedicated error
      if (!isDefined(fieldMetadata)) {
        continue;
      }

      if (
        isAccessedByFieldName &&
        isMorphOrRelationFlatFieldMetadata(fieldMetadata)
      ) {
        // Relation orderBy values are not carried by cursors yet
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
  }
};
