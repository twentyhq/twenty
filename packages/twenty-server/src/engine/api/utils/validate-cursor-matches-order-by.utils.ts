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
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
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
  for (const resolvedOrderByField of resolveOrderByFields({
    orderBy,
    flatObjectMetadata,
    flatFieldMetadataMaps,
  })) {
    const { fieldName } = resolvedOrderByField;

    switch (resolvedOrderByField.kind) {
      // Relation orderBy values are not carried by cursors yet
      case 'relation':
        break;
      case 'composite': {
        const compositeCursorValue = cursor[fieldName];

        for (const property of resolvedOrderByField.orderedCompositeProperties) {
          const hasNestedValue =
            isPlainObject(compositeCursorValue) &&
            compositeCursorValue[property.name] !== undefined;
          // Legacy cursors carried composite values under dotted keys
          const hasDottedValue =
            cursor[`${fieldName}.${property.name}`] !== undefined;

          if (!hasNestedValue && !hasDottedValue) {
            throwCursorOrderByMismatch(`${fieldName}.${property.name}`);
          }
        }
        break;
      }
      case 'scalar':
        if (cursor[fieldName] === undefined) {
          throwCursorOrderByMismatch(fieldName);
        }
        break;
    }
  }
};
