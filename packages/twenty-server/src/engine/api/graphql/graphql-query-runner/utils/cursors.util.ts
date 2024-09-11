import { FindOptionsOrderValue } from 'typeorm';

import { Record as IRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';

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

export const encodeCursor = <ObjectRecord extends IRecord = IRecord>(
  objectRecord: ObjectRecord,
  order: Record<string, FindOptionsOrderValue> | undefined,
): string => {
  const orderByValues: Record<string, any> = {};

  Object.keys(order ?? {}).forEach((key) => {
    orderByValues[key] = objectRecord[key];
  });

  const cursorData: CursorData = {
    ...orderByValues,
    id: objectRecord.id,
  };

  return Buffer.from(JSON.stringify(cursorData)).toString('base64');
};
