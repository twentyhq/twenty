import { FindOptionsOrderValue } from 'typeorm';

import { Record as IRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';

import { CONNECTION_MAX_DEPTH } from 'src/engine/api/graphql/graphql-query-runner/constants/connection-max-depth.constant';

/**
 * Creates a connection object from an array of object records, with support for nested connections.
 *
 * @param objectRecords - The array of object records to create the connection from.
 * @param take - The number of records to take from the connection.
 * @param totalCount - The total count of records in the connection.
 * @param order - The order object to use for encoding the cursor.
 * @param depth - The current depth of the nested connections.
 * @returns The created connection object.
 */
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

/**
 * Recursively processes nested connections in an object record, creating a connection object for any nested arrays.
 *
 * @param objectRecord - The object record to process.
 * @param take - The number of records to take from the connection.
 * @param totalCount - The total count of records in the connection.
 * @param order - The order object to use for encoding the cursor.
 * @param depth - The current depth of the nested connections.
 * @returns The processed object record.
 * @throws {Error} If the maximum depth of nested connections is reached.
 */
const processNestedConnections = <T extends Record<string, any>>(
  objectRecord: T,
  take: number,
  totalCount: number,
  order: Record<string, FindOptionsOrderValue> | undefined,
  depth = 0,
): T => {
  if (depth >= CONNECTION_MAX_DEPTH) {
    throw new Error(`Maximum depth of ${CONNECTION_MAX_DEPTH} reached`);
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
    } else if (typeof value === 'object' && value !== null) {
      processedObjectRecords[key] = processNestedConnections(
        value,
        take,
        totalCount,
        order,
        depth + 1,
      );
    }
  }

  return processedObjectRecords as T;
};

/**
 * Decodes a base64-encoded cursor string into an object record.
 *
 * @param cursor - The base64-encoded cursor string to decode.
 * @returns The object record represented by the cursor.
 * @throws {Error} If the cursor is invalid.
 */
export const decodeCursor = (cursor: string): Record<string, any> => {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString());
  } catch (err) {
    throw new Error('Cursor is invalid');
  }
};

/**
 * Encodes an object record into a base64-encoded cursor string.
 *
 * @param objectRecord - The object record to encode.
 * @param order - The order object to use for encoding the cursor.
 * @returns A base64-encoded cursor string.
 */
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
