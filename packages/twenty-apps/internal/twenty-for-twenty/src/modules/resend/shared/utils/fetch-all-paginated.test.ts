import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchAllPaginated,
  type ResendListFn,
} from 'src/modules/resend/shared/utils/fetch-all-paginated';

type Item = { id: string };

type ListResponse = Awaited<ReturnType<ResendListFn<Item>>>;

const page = (ids: string[], hasMore: boolean): ListResponse => ({
  data: { data: ids.map((id) => ({ id })), has_more: hasMore },
  error: null,
});

const makeListFn = (
  pages: ListResponse[],
): { fn: ResendListFn<Item>; calls: { limit: number; after?: string }[] } => {
  const calls: { limit: number; after?: string }[] = [];
  let index = 0;

  const fn: ResendListFn<Item> = async (params) => {
    calls.push(params);
    const result = pages[index] ?? page([], false);

    index++;

    return result;
  };

  return { fn, calls };
};

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fetchAllPaginated', () => {
  it('returns items from a single page when has_more is false', async () => {
    const { fn, calls } = makeListFn([page(['a', 'b', 'c'], false)]);

    const result = await fetchAllPaginated(fn);

    expect(result.map((item) => item.id)).toEqual(['a', 'b', 'c']);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({ limit: 100 });
  });

  it('follows cursor across pages and concatenates results', async () => {
    const { fn, calls } = makeListFn([
      page(['a', 'b'], true),
      page(['c', 'd'], true),
      page(['e'], false),
    ]);

    const result = await fetchAllPaginated(fn);

    expect(result.map((item) => item.id)).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(calls).toEqual([
      { limit: 100 },
      { limit: 100, after: 'b' },
      { limit: 100, after: 'd' },
    ]);
  });

  it('stops when a page returns an empty array', async () => {
    const { fn, calls } = makeListFn([
      page(['a'], true),
      page([], true),
      page(['b'], false),
    ]);

    const result = await fetchAllPaginated(fn);

    expect(result.map((item) => item.id)).toEqual(['a']);
    expect(calls).toHaveLength(2);
  });

  it('stops when data is null', async () => {
    const { fn } = makeListFn([
      page(['a'], true),
      { data: null, error: null },
    ]);

    const result = await fetchAllPaginated(fn);

    expect(result.map((item) => item.id)).toEqual(['a']);
  });

  it('includes label and cursor in the error message when listFn returns an error', async () => {
    const fn: ResendListFn<Item> = async (params) => {
      if (params.after === 'a') {
        return { data: null, error: { code: 'boom' } };
      }

      return page(['a'], true);
    };

    await expect(fetchAllPaginated(fn, 'broadcasts')).rejects.toThrow(
      /Resend list\[broadcasts\] failed at cursor=a: .*boom/,
    );
  });

  it('throws when the cursor does not advance', async () => {
    const { fn } = makeListFn([page(['a'], true), page(['a'], true)]);

    await expect(fetchAllPaginated(fn, 'segments')).rejects.toThrow(
      /Resend list\[segments\] cursor stuck at a/,
    );
  });
});
