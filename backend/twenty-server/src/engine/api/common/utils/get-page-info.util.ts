import { type ObjectRecord } from 'twenty-shared/types';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type CommonPageInfo } from 'src/engine/api/common/types/common-page-info.type';
import {
  encodeCursor,
  getPaginationInfo,
} from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';

export const getPageInfo = (
  records: ObjectRecord[],
  orderBy: ObjectRecordOrderBy,
  limit: number,
  isForwardPagination: boolean,
): CommonPageInfo => {
  const { hasNextPage, hasPreviousPage, hasMoreRecords } = getPaginationInfo(
    records,
    limit,
    isForwardPagination,
  );

  if (hasMoreRecords) {
    records.pop();
  }

  const startCursor =
    records.length > 0 ? encodeCursor(records[0], orderBy) : null;
  const endCursor =
    records.length > 0
      ? encodeCursor(records[records.length - 1], orderBy)
      : null;

  return { startCursor, endCursor, hasNextPage, hasPreviousPage };
};
