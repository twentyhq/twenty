import { type ObjectRecord } from 'twenty-shared/types';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { type FindManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { resolveOrderByFields } from 'src/engine/api/utils/resolve-order-by-fields.utils';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export interface CursorData {
  // oxlint-disable-next-line typescript/no-explicit-any
  [key: string]: any;
}

export const decodeCursor = <T = CursorData>(cursor: string): T => {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString());
  } catch {
    throw new CommonQueryRunnerException(
      `Invalid cursor: ${cursor}`,
      CommonQueryRunnerExceptionCode.INVALID_CURSOR,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }
};

export const encodeCursor = <T extends ObjectRecord = ObjectRecord>({
  objectRecord,
  order,
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  objectRecord: T;
  order: ObjectRecordOrderBy | undefined;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): string => {
  // oxlint-disable-next-line typescript/no-explicit-any
  const orderByValues: Record<string, any> = {};

  for (const resolvedOrderByField of resolveOrderByFields({
    orderBy: order,
    flatObjectMetadata,
    flatFieldMetadataMaps,
  })) {
    const { fieldName } = resolvedOrderByField;

    switch (resolvedOrderByField.kind) {
      // Relation orderBy entries carry only the ordered sub-field values, read
      // from the loaded related record; an unloaded relation or sub-field leaves
      // the cursor incomplete, which cursor decoding reports with a dedicated
      // error instead of paginating incorrectly
      case 'relation': {
        const relatedRecord = objectRecord[fieldName] as
          | Record<string, unknown>
          | null
          | undefined;

        if (relatedRecord === undefined) {
          break;
        }

        const existingRelationValue: Record<string, unknown> =
          orderByValues[fieldName] ?? {};

        for (const subFieldName of resolvedOrderByField.orderedSubFieldNames) {
          const subFieldValue =
            relatedRecord === null ? null : relatedRecord[subFieldName];

          if (subFieldValue !== undefined) {
            existingRelationValue[subFieldName] = subFieldValue;
          }
        }

        orderByValues[fieldName] = existingRelationValue;
        break;
      }
      case 'composite': {
        const recordCompositeValue = objectRecord[fieldName] as
          | Record<string, unknown>
          | null
          | undefined;
        const existingCompositeValue: Record<string, unknown> =
          orderByValues[fieldName] ?? {};

        for (const property of resolvedOrderByField.orderedCompositeProperties) {
          existingCompositeValue[property.name] =
            recordCompositeValue?.[property.name];
        }

        orderByValues[fieldName] = existingCompositeValue;
        break;
      }
      case 'scalar':
        orderByValues[fieldName] = objectRecord[fieldName];
        break;
    }
  }

  const cursorData: CursorData = {
    ...orderByValues,
    id: objectRecord.id,
  };

  return encodeCursorData(cursorData);
};

export const encodeCursorData = (cursorData: CursorData) => {
  return Buffer.from(JSON.stringify(cursorData)).toString('base64');
};

export const getCursor = (
  // oxlint-disable-next-line typescript/no-explicit-any
  args: FindManyResolverArgs<any, any>,
  // oxlint-disable-next-line typescript/no-explicit-any
): Record<string, any> | undefined => {
  if (args.after) return decodeCursor(args.after);
  if (args.before) return decodeCursor(args.before);

  return undefined;
};
