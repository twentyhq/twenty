import { isDefined } from 'twenty-shared/utils';

import { withRateLimitRetry } from 'src/modules/resend/shared/utils/with-rate-limit-retry';

const PAGE_SIZE = 100;

export type ResendListFn<T> = (params: {
  limit: number;
  after?: string;
}) => Promise<{
  data: { data: T[]; has_more: boolean } | null;
  error: unknown;
}>;

export const fetchAllPaginated = async <T extends { id: string }>(
  listFn: ResendListFn<T>,
  label = 'items',
): Promise<T[]> => {
  const items: T[] = [];
  let cursor: string | undefined;

  while (true) {
    const params = {
      limit: PAGE_SIZE,
      ...(isDefined(cursor) && { after: cursor }),
    };
    const response = await withRateLimitRetry(() => listFn(params));

    if (isDefined(response.error)) {
      throw new Error(
        `Resend list[${label}] failed at cursor=${cursor ?? 'start'}: ${JSON.stringify(response.error)}`,
      );
    }

    const page = response.data;

    if (!isDefined(page) || page.data.length === 0) break;

    items.push(...page.data);

    if (!page.has_more) break;

    const nextCursor = page.data[page.data.length - 1].id;

    if (nextCursor === cursor) {
      throw new Error(`Resend list[${label}] cursor stuck at ${nextCursor}`);
    }

    cursor = nextCursor;
  }

  return items;
};
