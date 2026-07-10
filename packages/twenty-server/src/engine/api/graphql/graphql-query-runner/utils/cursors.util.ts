import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { type FindManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  type CursorData,
  decodeCursor,
  encodeCursorData,
} from 'src/engine/api/common/utils/cursor.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

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
  const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
    flatFieldMetadataMaps,
    flatObjectMetadata,
  );

  // oxlint-disable-next-line typescript/no-explicit-any
  const orderByValues: Record<string, any> = {};

  for (const orderByEntry of order ?? []) {
    for (const [key, value] of Object.entries(orderByEntry)) {
      const fieldMetadataId = fieldIdByName[key];
      const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityId: fieldMetadataId,
      });

      if (!isDefined(fieldMetadata)) {
        continue;
      }

      if (
        isCompositeFieldMetadataType(fieldMetadata.type) &&
        isPlainObject(value) &&
        isDefined(value)
      ) {
        const compositeOrderByKeys = Object.keys(
          value as Record<string, unknown>,
        );
        const existingCompositeValue: Record<string, unknown> =
          orderByValues[key] ?? {};
        const recordCompositeValue = objectRecord[key] as
          | Record<string, unknown>
          | null
          | undefined;

        for (const subKey of compositeOrderByKeys) {
          existingCompositeValue[subKey] = recordCompositeValue?.[subKey];
        }

        orderByValues[key] = existingCompositeValue;
      } else {
        orderByValues[key] = objectRecord[key];
      }
    }
  }

  const cursorData: CursorData = {
    ...orderByValues,
    id: objectRecord.id,
  };

  return encodeCursorData(cursorData);
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
