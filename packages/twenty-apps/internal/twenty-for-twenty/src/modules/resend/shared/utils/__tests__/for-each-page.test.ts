import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  forEachPage,
  type ResendListFunction,
} from '@modules/resend/shared/utils/for-each-page';

type Item = { id: string };

type ListResponse = Awaited<ReturnType<ResendListFunction<Item>>>;

const page = (ids: string[], hasMore: boolean): ListResponse => ({
  data: { data: ids.map((id) => ({ id })), has_more: hasMore },
  error: null,
});

const createMockListFunction = (
  pages: ListResponse[],
): {
  listFunction: ResendListFunction<Item>;
  calls: { limit: number; after?: string }[];
} => {
  const calls: { limit: number; after?: string }[] = [];
  let index = 0;

  const listFunction: ResendListFunction<Item> = async (
    paginationParameters,
  ) => {
    calls.push(paginationParameters);
    const result = pages[index] ?? page([], false);

    index++;

    return result;
  };

  return { listFunction, calls };
};

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('forEachPage', () => {
  it('calls onPage with each page in order', async () => {
    const { listFunction } = createMockListFunction([
      page(['a', 'b'], true),
      page(['c'], false),
    ]);

    const seen: { ids: string[]; pageNumber: number }[] = [];

    await forEachPage(listFunction, async (items, pageNumber) => {
      seen.push({ ids: items.map((item) => item.id), pageNumber });
    });

    expect(seen).toEqual([
      { ids: ['a', 'b'], pageNumber: 1 },
      { ids: ['c'], pageNumber: 2 },
    ]);
  });

  it('starts from options.startCursor when provided', async () => {
    const { listFunction, calls } = createMockListFunction([
      page(['c', 'd'], false),
    ]);

    await forEachPage(listFunction, async () => {}, 'items', {
      startCursor: 'b',
    });

    expect(calls[0]).toEqual({ limit: 100, after: 'b' });
  });

  it('omits after when startCursor is an empty string', async () => {
    const { listFunction, calls } = createMockListFunction([
      page(['a'], false),
    ]);

    await forEachPage(listFunction, async () => {}, 'items', {
      startCursor: '',
    });

    expect(calls[0]).toEqual({ limit: 100 });
  });

  it('calls onCursorAdvance after each successful page with the last item id', async () => {
    const { listFunction } = createMockListFunction([
      page(['a', 'b'], true),
      page(['c', 'd'], false),
    ]);

    const advances: { cursor: string }[] = [];

    await forEachPage(listFunction, async () => {}, 'items', {
      onCursorAdvance: async (cursor) => {
        advances.push({ cursor });
      },
    });

    expect(advances).toEqual([{ cursor: 'b' }, { cursor: 'd' }]);
  });

  it('does not call onCursorAdvance when onPage throws', async () => {
    const { listFunction } = createMockListFunction([
      page(['a'], true),
      page(['b'], false),
    ]);
    const onCursorAdvance = vi.fn(async () => {});

    await expect(
      forEachPage(
        listFunction,
        async () => {
          throw new Error('boom');
        },
        'items',
        { onCursorAdvance },
      ),
    ).rejects.toThrow('boom');

    expect(onCursorAdvance).not.toHaveBeenCalled();
  });

  it('persists cursor for the final page even when has_more is false', async () => {
    const { listFunction } = createMockListFunction([page(['a', 'b'], false)]);
    const onCursorAdvance = vi.fn(async () => {});

    await forEachPage(listFunction, async () => {}, 'items', {
      onCursorAdvance,
    });

    expect(onCursorAdvance).toHaveBeenCalledTimes(1);
    expect(onCursorAdvance).toHaveBeenCalledWith('b');
  });

  it('continues past pages that return ok=false and advances the cursor over them', async () => {
    const { listFunction, calls } = createMockListFunction([
      page(['a', 'b'], true),
      page(['c', 'd'], true),
      page(['e', 'f'], false),
    ]);

    const onCursorAdvance = vi.fn(async () => {});
    const seenPages: string[][] = [];

    await forEachPage(
      listFunction,
      async (items, pageNumber) => {
        seenPages.push(items.map((item) => item.id));

        return { ok: pageNumber !== 2, errors: ['boom'] };
      },
      'items',
      { onCursorAdvance },
    );

    expect(seenPages).toEqual([
      ['a', 'b'],
      ['c', 'd'],
      ['e', 'f'],
    ]);
    expect(calls).toHaveLength(3);
    expect(onCursorAdvance).toHaveBeenCalledTimes(3);
    expect(onCursorAdvance).toHaveBeenLastCalledWith('f');
  });

  it('treats a void onPage return as ok and advances the cursor', async () => {
    const { listFunction } = createMockListFunction([page(['a'], false)]);
    const onCursorAdvance = vi.fn(async () => {});

    await forEachPage(listFunction, async () => {}, 'items', {
      onCursorAdvance,
    });

    expect(onCursorAdvance).toHaveBeenCalledWith('a');
  });

  it('throws when the cursor does not advance across pages', async () => {
    const { listFunction } = createMockListFunction([
      page(['a'], true),
      page(['a'], true),
    ]);

    await expect(
      forEachPage(listFunction, async () => {}, 'segments'),
    ).rejects.toThrow(/Resend list\[segments\] cursor stuck at a/);
  });

  it('stops requesting additional pages once deadlineAtMs is reached', async () => {
    const { listFunction, calls } = createMockListFunction([
      page(['a', 'b'], true),
      page(['c', 'd'], true),
      page(['e', 'f'], true),
    ]);

    const onCursorAdvance = vi.fn(async () => {});
    const seenPages: string[][] = [];

    let now = 1_000;
    const dateNowSpy = vi.spyOn(Date, 'now').mockImplementation(() => now);

    await forEachPage(
      listFunction,
      async (items) => {
        seenPages.push(items.map((item) => item.id));
        now += 1_000;
      },
      'items',
      {
        onCursorAdvance,
        deadlineAtMs: 2_500,
      },
    );

    expect(seenPages).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
    expect(calls).toHaveLength(2);
    expect(onCursorAdvance).toHaveBeenCalledTimes(2);
    expect(onCursorAdvance).toHaveBeenLastCalledWith('d');

    dateNowSpy.mockRestore();
  });

  it('still processes the first page even if the deadline is already past at start', async () => {
    const { listFunction, calls } = createMockListFunction([
      page(['a'], true),
      page(['b'], false),
    ]);

    const onCursorAdvance = vi.fn(async () => {});
    const seenPages: string[][] = [];

    const dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(10_000);

    await forEachPage(
      listFunction,
      async (items) => {
        seenPages.push(items.map((item) => item.id));
      },
      'items',
      {
        onCursorAdvance,
        deadlineAtMs: 0,
      },
    );

    expect(seenPages).toEqual([['a']]);
    expect(calls).toHaveLength(1);
    expect(onCursorAdvance).toHaveBeenCalledTimes(1);
    expect(onCursorAdvance).toHaveBeenCalledWith('a');

    dateNowSpy.mockRestore();
  });
});
