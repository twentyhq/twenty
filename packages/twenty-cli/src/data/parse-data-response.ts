import {
  isArray,
  isBoolean,
  isNonEmptyString,
  isNull,
  isNumber,
  isUndefined,
} from '@sniptt/guards';
import { isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';

import { type DataPage } from '@/data/types/data-page.type';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';

const createInvalidResponseError = () =>
  new CliError({
    code: 'INVALID_RESPONSE',
    message: 'The server returned an invalid record response.',
  });

const isCursor = (value: unknown): value is string | null =>
  isNull(value) || isNonEmptyString(value);

export const parseDataPage = (
  body: unknown,
  objectName: string,
  limit: number,
): DataPage => {
  if (!isPlainObject(body) || !isPlainObject(body.data)) {
    throw createInvalidResponseError();
  }

  const records = body.data[objectName];
  const pageInfo = body.pageInfo;
  const totalCount = body.totalCount;

  if (
    !isArray(records) ||
    records.length > limit ||
    !records.every(isPlainObject) ||
    !isPlainObject(pageInfo) ||
    !isBoolean(pageInfo.hasNextPage) ||
    (!isUndefined(pageInfo.hasPreviousPage) &&
      !isBoolean(pageInfo.hasPreviousPage)) ||
    !isCursor(pageInfo.startCursor) ||
    !isCursor(pageInfo.endCursor) ||
    (isNonEmptyArray(records) &&
      (!isNonEmptyString(pageInfo.startCursor) ||
        !isNonEmptyString(pageInfo.endCursor))) ||
    (pageInfo.hasNextPage &&
      (!isNonEmptyArray(records) || !isNonEmptyString(pageInfo.endCursor))) ||
    !isNumber(totalCount) ||
    !Number.isSafeInteger(totalCount) ||
    totalCount < 0
  ) {
    throw createInvalidResponseError();
  }

  return {
    records,
    pageInfo: {
      hasNextPage: pageInfo.hasNextPage,
      ...(isBoolean(pageInfo.hasPreviousPage)
        ? { hasPreviousPage: pageInfo.hasPreviousPage }
        : {}),
      startCursor: pageInfo.startCursor,
      endCursor: pageInfo.endCursor,
    },
    totalCount,
  };
};

export const parseDataRecord = (body: unknown, objectName: string) => {
  if (!isPlainObject(body) || !isPlainObject(body.data)) {
    throw createInvalidResponseError();
  }

  const record = body.data[objectName];

  if (isNull(record)) {
    throw new CliError({
      code: 'NOT_FOUND',
      exitCode: EXIT_CODE.NOT_FOUND,
      message: `No ${objectName} record has that id.`,
    });
  }

  if (!isPlainObject(record)) {
    throw createInvalidResponseError();
  }

  return record;
};
