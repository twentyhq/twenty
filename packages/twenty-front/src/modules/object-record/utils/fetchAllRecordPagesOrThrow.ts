import { type ErrorLike } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { isBoolean, isNonEmptyString } from '@sniptt/guards';
import { doNotTranslate } from 'twenty-shared/i18n';
import { CustomError, isDefined } from 'twenty-shared/utils';

import { type RecordGqlConnectionEdgesRequired } from '@/object-record/graphql/types/RecordGqlConnectionEdgesRequired';
import { sleep } from '~/utils/sleep';

const RECORD_PAGINATION_ERROR_CODE = doNotTranslate(
  'RECORD_PAGINATION_INCOMPLETE',
);

type FetchRecordPageResult = {
  connection?: RecordGqlConnectionEdgesRequired | null;
  error?: ErrorLike;
};

type RecordPageProgress = {
  processedRecordCount: number;
  totalRecordCount: number;
};

const createIncompleteRecordResultError = () =>
  new CustomError(
    t`We couldn't load all the records. Please try again.`,
    RECORD_PAGINATION_ERROR_CODE,
  );

const getRecordPageConnectionOrThrow = ({
  result,
  shouldThrowOnIncompleteResult,
}: {
  result: FetchRecordPageResult | undefined;
  shouldThrowOnIncompleteResult: boolean;
}) => {
  if (isDefined(result?.error)) {
    throw result.error;
  }

  const connection = result?.connection;
  const hasCompletePageInfo = isBoolean(connection?.pageInfo?.hasNextPage);

  if (
    !shouldThrowOnIncompleteResult ||
    (isDefined(connection) && hasCompletePageInfo)
  ) {
    return connection;
  }

  throw createIncompleteRecordResultError();
};

export const fetchAllRecordPagesOrThrow = async ({
  fetchFirstPage,
  fetchNextPage,
  maximumRequests,
  pageSize,
  delayMs,
  shouldThrowOnIncompleteResult = false,
  onPageFetched,
}: {
  fetchFirstPage: () => Promise<FetchRecordPageResult | undefined>;
  fetchNextPage: () => Promise<FetchRecordPageResult | undefined>;
  maximumRequests: number;
  pageSize: number;
  delayMs: number;
  shouldThrowOnIncompleteResult?: boolean;
  onPageFetched?: (progress: RecordPageProgress) => void;
}) => {
  let connection = getRecordPageConnectionOrThrow({
    result: await fetchFirstPage(),
    shouldThrowOnIncompleteResult,
  });
  const records = connection?.edges.map(({ node }) => node) ?? [];
  const totalCount = connection?.totalCount ?? 0;
  const remainingPages = Math.ceil((totalCount - records.length) / pageSize);
  const requestLimit = shouldThrowOnIncompleteResult
    ? maximumRequests
    : Math.min(maximumRequests, remainingPages);

  onPageFetched?.({
    processedRecordCount: records.length,
    totalRecordCount: totalCount,
  });

  let previousCursor: string | undefined;
  let hasMorePages = shouldThrowOnIncompleteResult
    ? connection?.pageInfo?.hasNextPage === true
    : remainingPages > 0;

  for (
    let pageIndex = 0;
    hasMorePages && pageIndex < requestLimit;
    pageIndex++
  ) {
    const nextCursor = connection?.pageInfo?.endCursor;
    const canAdvanceCursor =
      isNonEmptyString(nextCursor) && nextCursor !== previousCursor;

    if (!canAdvanceCursor && shouldThrowOnIncompleteResult) {
      throw createIncompleteRecordResultError();
    }

    if (!canAdvanceCursor) {
      break;
    }

    previousCursor = nextCursor;

    if (delayMs > 0) {
      await sleep(delayMs);
    }

    connection = getRecordPageConnectionOrThrow({
      result: await fetchNextPage(),
      shouldThrowOnIncompleteResult,
    });

    if (!isDefined(connection)) {
      break;
    }

    for (const { node } of connection.edges) {
      records.push(node);
    }

    onPageFetched?.({
      processedRecordCount: records.length,
      totalRecordCount: totalCount,
    });

    hasMorePages = shouldThrowOnIncompleteResult
      ? connection.pageInfo?.hasNextPage === true
      : connection.pageInfo?.hasNextPage !== false;
  }

  if (shouldThrowOnIncompleteResult && hasMorePages) {
    throw createIncompleteRecordResultError();
  }

  return records;
};
