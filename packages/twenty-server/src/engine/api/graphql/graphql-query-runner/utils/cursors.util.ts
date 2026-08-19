import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { type FindManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { resolveOrderByFields } from 'src/engine/api/utils/resolve-order-by-fields.utils';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
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

  for (const {
    fieldName,
    orderByValue,
    fieldMetadata,
    isAccessedByFieldName,
  } of resolveOrderByFields({
    orderBy: order,
    flatObjectMetadata,
    flatFieldMetadataMaps,
  })) {
    // Relation orderBy entries carry only the ordered sub-field values, read
    // from the loaded related record; an unloaded relation or sub-field leaves
    // the cursor incomplete, which cursor decoding reports with a dedicated
    // error instead of paginating incorrectly
    if (
      isAccessedByFieldName &&
      isMorphOrRelationFlatFieldMetadata(fieldMetadata) &&
      isPlainObject(orderByValue)
    ) {
      const relatedRecord = objectRecord[fieldName] as
        | Record<string, unknown>
        | null
        | undefined;

      if (relatedRecord === undefined) {
        continue;
      }

      const existingRelationValue: Record<string, unknown> =
        orderByValues[fieldName] ?? {};

      for (const subFieldKey of Object.keys(
        orderByValue as Record<string, unknown>,
      )) {
        if (relatedRecord === null) {
          existingRelationValue[subFieldKey] = null;
        } else if (relatedRecord[subFieldKey] !== undefined) {
          existingRelationValue[subFieldKey] = relatedRecord[subFieldKey];
        }
      }

      orderByValues[fieldName] = existingRelationValue;
      continue;
    }

    if (
      isCompositeFieldMetadataType(fieldMetadata.type) &&
      isPlainObject(orderByValue) &&
      isDefined(orderByValue)
    ) {
      const compositeOrderByKeys = Object.keys(
        orderByValue as Record<string, unknown>,
      );
      const existingCompositeValue: Record<string, unknown> =
        orderByValues[fieldName] ?? {};
      const recordCompositeValue = objectRecord[fieldName] as
        | Record<string, unknown>
        | null
        | undefined;

      for (const subKey of compositeOrderByKeys) {
        existingCompositeValue[subKey] = recordCompositeValue?.[subKey];
      }

      orderByValues[fieldName] = existingCompositeValue;
    } else {
      orderByValues[fieldName] = objectRecord[fieldName];
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
