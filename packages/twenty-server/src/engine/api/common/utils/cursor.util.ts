import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';

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

export const encodeCursorData = (cursorData: CursorData) => {
  return Buffer.from(JSON.stringify(cursorData)).toString('base64');
};

export const getPaginationInfo = <T>(
  records: T[],
  limit: number,
  isForwardPagination: boolean,
) => {
  const hasMoreRecords = records.length > limit;

  return {
    hasNextPage: isForwardPagination && hasMoreRecords,
    hasPreviousPage: !isForwardPagination && hasMoreRecords,
    hasMoreRecords,
  };
};
