import {
  ObjectRecord,
  ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { FindManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';

export interface CursorData {
  [key: string]: any;
}

export const decodeCursor = (cursor: string): CursorData => {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString());
  } catch (err) {
    throw new GraphqlQueryRunnerException(
      `Invalid cursor: ${cursor}`,
      GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
    );
  }
};

export const encodeCursor = <T extends ObjectRecord = ObjectRecord>(
  objectRecord: T,
  order: ObjectRecordOrderBy | undefined,
): string => {
  const orderByValues: Record<string, any> = {};

  const orderBy = order?.reduce((acc, orderBy) => ({ ...acc, ...orderBy }), {});

  const orderByKeys = Object.keys(orderBy ?? {});

  orderByKeys?.forEach((key) => {
    orderByValues[key] = objectRecord[key];
  });

  const cursorData: CursorData = {
    ...orderByValues,
    id: objectRecord.id,
  };

  return Buffer.from(JSON.stringify(cursorData)).toString('base64');
};

export const getCursor = (
  args: FindManyResolverArgs<any, any>,
): Record<string, any> | undefined => {
  if (args.after) return decodeCursor(args.after);
  if (args.before) return decodeCursor(args.before);

  return undefined;
};

export const getPaginationInfo = (
  objectRecords: any[],
  limit: number,
  isForwardPagination: boolean,
) => {
  const hasMoreRecords = objectRecords.length > limit;

  return {
    hasNextPage: isForwardPagination && hasMoreRecords,
    hasPreviousPage: !isForwardPagination && hasMoreRecords,
  };
};
