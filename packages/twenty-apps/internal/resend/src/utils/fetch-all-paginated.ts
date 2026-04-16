import { isDefined } from 'twenty-shared/utils';

export const fetchAllPaginated = async <TData extends { id: string }>(
  listFn: (params: { limit: number; after?: string }) => Promise<{
    data: { data: TData[]; has_more: boolean } | null;
    error: unknown;
  }>,
): Promise<TData[]> => {
  const allItems: TData[] = [];

  let cursor: string | undefined;

  let hasMore = true;

  while (hasMore) {
    const params: { limit: number; after?: string } = { limit: 100 };

    if (isDefined(cursor)) {
      params.after = cursor;
    }

    const { data, error } = await listFn(params);

    if (isDefined(error)) {
      throw new Error(`Resend API error: ${JSON.stringify(error)}`);
    }

    if (!isDefined(data)) {
      break;
    }

    allItems.push(...data.data);
    hasMore = data.has_more;

    if (hasMore && data.data.length > 0) {
      cursor = data.data[data.data.length - 1].id;
    }
  }

  return allItems;
};
