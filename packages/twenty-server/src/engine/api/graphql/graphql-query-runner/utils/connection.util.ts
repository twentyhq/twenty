import { FindOptionsOrderValue } from 'typeorm';

import { Record as IRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';

import { CONNECTION_MAX_DEPTH } from 'src/engine/api/graphql/graphql-query-runner/constants/connection-max-depth.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { isPlainObject } from 'src/utils/is-plain-object';

export const createConnection = <ObjectRecord extends IRecord = IRecord>(
  objectRecords: ObjectRecord[],
  take: number,
  totalCount: number,
  order: Record<string, FindOptionsOrderValue> | undefined,
  depth = 0,
): IConnection<ObjectRecord> => {
  const edges = (objectRecords ?? []).map((objectRecord) => ({
    node: processNestedConnections(
      objectRecord,
      take,
      totalCount,
      order,
      depth,
    ),
    cursor: encodeCursor(objectRecord, order),
  }));

  return {
    edges,
    pageInfo: {
      hasNextPage: objectRecords.length === take && totalCount > take,
      hasPreviousPage: false,
      startCursor: edges[0]?.cursor,
      endCursor: edges[edges.length - 1]?.cursor,
    },
    totalCount: totalCount,
  };
};

const processNestedConnections = <T extends Record<string, any>>(
  objectRecord: T,
  take: number,
  totalCount: number,
  order: Record<string, FindOptionsOrderValue> | undefined,
  depth = 0,
): T => {
  if (depth >= CONNECTION_MAX_DEPTH) {
    throw new GraphqlQueryRunnerException(
      `Maximum depth of ${CONNECTION_MAX_DEPTH} reached`,
      GraphqlQueryRunnerExceptionCode.MAX_DEPTH_REACHED,
    );
  }

  const processedObjectRecords: Record<string, any> = { ...objectRecord };

  for (const [key, value] of Object.entries(objectRecord)) {
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] !== 'object') {
        processedObjectRecords[key] = value;
      } else {
        processedObjectRecords[key] = createConnection(
          value,
          take,
          value.length,
          order,
          depth + 1,
        );
      }
    } else if (value instanceof Date) {
      processedObjectRecords[key] = value.toISOString();
    } else if (isPlainObject(value)) {
      processedObjectRecords[key] = processNestedConnections(
        value,
        take,
        totalCount,
        order,
        depth + 1,
      );
    } else {
      processedObjectRecords[key] = value;
    }
  }

  return processedObjectRecords as T;
};

export const decodeCursor = (cursor: string): Record<string, any> => {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString());
  } catch (err) {
    throw new GraphqlQueryRunnerException(
      `Invalid cursor: ${cursor}`,
      GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
    );
  }
};

export const encodeCursor = <ObjectRecord extends IRecord = IRecord>(
  objectRecord: ObjectRecord,
  order: Record<string, FindOptionsOrderValue> | undefined,
): string => {
  const cursor = {};

  Object.keys(order ?? []).forEach((key) => {
    cursor[key] = objectRecord[key];
  });

  cursor['id'] = objectRecord.id;

  return Buffer.from(JSON.stringify(Object.values(cursor))).toString('base64');
};
