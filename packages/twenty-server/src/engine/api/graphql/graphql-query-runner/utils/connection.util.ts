import { FindOptionsOrderValue } from 'typeorm';

import { Record as IRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';

import { CONNECTION_MAX_DEPTH } from 'src/engine/api/graphql/graphql-query-runner/constants/connection-max-depth.constant';

export const createConnection = <ObjectRecord extends IRecord = IRecord>(
  items: ObjectRecord[],
  totalCount: number,
  order: Record<string, FindOptionsOrderValue> | undefined,
  depth = 0,
): IConnection<ObjectRecord> => {
  const edges = (items ?? []).map((item) => ({
    node: processNestedConnections(item, order, depth),
    cursor: encodeCursor(item, order),
  }));

  return {
    edges,
    pageInfo: {
      hasNextPage: items.length < totalCount,
      hasPreviousPage: false,
      startCursor: edges[0]?.cursor,
      endCursor: edges[edges.length - 1]?.cursor,
    },
    totalCount: totalCount,
  };
};

const processNestedConnections = <T extends Record<string, any>>(
  item: T,
  order: Record<string, FindOptionsOrderValue> | undefined,
  depth = 0,
): T => {
  if (depth >= CONNECTION_MAX_DEPTH) {
    throw new Error(`Maximum depth of ${CONNECTION_MAX_DEPTH} reached`);
  }

  const processedItem: Record<string, any> = { ...item };

  for (const [key, value] of Object.entries(item)) {
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] !== 'object') {
        processedItem[key] = value;
      } else {
        processedItem[key] = createConnection(
          value,
          value.length,
          order,
          depth + 1,
        );
      }
    } else if (value instanceof Date) {
      processedItem[key] = value.toISOString();
    } else if (typeof value === 'object' && value !== null) {
      processedItem[key] = processNestedConnections(value, order, depth + 1);
    }
  }

  return processedItem as T;
};

export const decodeCursor = (cursor: string): Record<string, any> => {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString());
  } catch (err) {
    throw new Error('Cursor is invalid');
  }
};

export const encodeCursor = <ObjectRecord extends IRecord = IRecord>(
  item: ObjectRecord,
  order: Record<string, FindOptionsOrderValue> | undefined,
): string => {
  const cursor = {};

  Object.keys(order ?? []).map((key) => {
    cursor[key] = item[key];
  });

  cursor['id'] = item.id;

  return Buffer.from(JSON.stringify(Object.values(cursor))).toString('base64');
};
