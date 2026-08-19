import { type ObjectRecord } from 'twenty-shared/types';
import { isPlainObject } from 'twenty-shared/utils';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { type FindManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  checkIfLeafCanCarryCursorValue,
  resolveOrderByLeaves,
} from 'src/engine/api/utils/resolve-order-by-leaves.utils';
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
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  orderByValuesFromScan,
}: {
  objectRecord: T;
  order: ObjectRecordOrderBy | undefined;
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps?: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  // Sort values read from the scan's raw rows by the find-many runner: they
  // carry the exact SQL values (NULLs included) the continuation must mirror.
  // Falling back to the formatted record covers callers without them (e.g.
  // nested connections), whose cursors do not continue a root scan.
  orderByValuesFromScan?: Record<string, unknown>;
}): string => {
  // oxlint-disable-next-line typescript/no-explicit-any
  const orderByValues: Record<string, any> = {};

  for (const leaf of resolveOrderByLeaves({
    orderBy: order,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }).filter(checkIfLeafCanCarryCursorValue)) {
    // Read the ordered value along the leaf's path: a null container yields
    // null (the row belongs to the NULL block of the ordering), a missing one
    // yields undefined, which JSON serialization drops
    const [rootKey, ...nestedKeys] = leaf.path;
    const valueSource = orderByValuesFromScan ?? objectRecord;
    let leafValue: unknown = valueSource[rootKey];

    for (const key of nestedKeys) {
      if (leafValue === null) {
        break;
      }
      leafValue = isPlainObject(leafValue) ? leafValue[key] : undefined;
    }

    // An unloaded relation cannot contribute a value at all: leave the key out
    // instead of writing an empty object
    if (leaf.kind === 'relation' && leafValue === undefined) {
      continue;
    }

    // Write it back under the same path
    let container = orderByValues;

    for (const key of leaf.path.slice(0, -1)) {
      container[key] = isPlainObject(container[key]) ? container[key] : {};
      container = container[key];
    }
    container[leaf.path[leaf.path.length - 1]] = leafValue;
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
