import { isDefined } from 'twenty-shared/utils';

import { withRateLimitRetry } from 'src/modules/resend/utils/with-rate-limit-retry';

const DEFAULT_PAGE_SIZE = 100;

export const fetchAllPaginated = async <TData extends { id: string }>(
  listFn: (params: { limit: number; after?: string }) => Promise<{
    data: { data: TData[]; has_more: boolean } | null;
    error: unknown;
  }>,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<TData[]> => {
  const allItems: TData[] = [];

  let cursor: string | undefined;

  let hasMore = true;

  while (hasMore) {
    const params: { limit: number; after?: string } = { limit: pageSize };

    if (isDefined(cursor)) {
      params.after = cursor;
    }

    const { data } = await withRateLimitRetry(async () => {
      const response = await listFn(params);

      if (isDefined(response.error)) {
        throw new Error(
          `Resend API error: ${JSON.stringify(response.error)}`,
        );
      }

      return response;
    });

    if (!isDefined(data)) {
      break;
    }

    allItems.push(...data.data);
    hasMore = data.has_more;

    if (hasMore && data.data.length === 0) {
      break;
    }

    if (hasMore && data.data.length > 0) {
      cursor = data.data[data.data.length - 1].id;
    }
  }

  return allItems;
};
