import { type ObjectRecord } from 'twenty-shared/types';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { type FindManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';

export interface CursorData {
  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  [key: string]: any;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getOrderByKeyPaths = (order: ObjectRecordOrderBy | undefined) => {
  return (
    order?.flatMap((orderBy) =>
      Object.entries(orderBy).flatMap(([key, value]) => {
        if (isObject(value)) {
          return Object.keys(value).map((subKey) => `${key}.${subKey}`);
        }

        return [key];
      }),
    ) ?? []
  );
};

const getByPath = <T extends ObjectRecord = ObjectRecord>(
  objectRecord: T,
  path: string,
) => {
  return path.split('.').reduce<unknown>((value, key) => {
    if (!isObject(value)) {
      return undefined;
    }

    return value[key];
  }, objectRecord);
};

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

export const encodeCursor = <T extends ObjectRecord = ObjectRecord>(
  objectRecord: T,
  order: ObjectRecordOrderBy | undefined,
): string => {
  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  const orderByValues: Record<string, any> = {};

  getOrderByKeyPaths(order).forEach((keyPath) => {
    orderByValues[keyPath] = getByPath(objectRecord, keyPath);
  });

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
  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  args: FindManyResolverArgs<any, any>,
  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
): Record<string, any> | undefined => {
  if (args.after) return decodeCursor(args.after);
  if (args.before) return decodeCursor(args.before);

  return undefined;
};

export const getPaginationInfo = (
  objectRecords: ObjectRecord[],
  limit: number,
  isForwardPagination: boolean,
) => {
  const hasMoreRecords = objectRecords.length > limit;

  return {
    hasNextPage: isForwardPagination && hasMoreRecords,
    hasPreviousPage: !isForwardPagination && hasMoreRecords,
    hasMoreRecords,
  };
};
