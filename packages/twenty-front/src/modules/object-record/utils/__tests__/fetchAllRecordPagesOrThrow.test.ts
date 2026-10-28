import { CustomError } from 'twenty-shared/utils';

import { type RecordGqlConnectionEdgesRequired } from '@/object-record/graphql/types/RecordGqlConnectionEdgesRequired';
import { fetchAllRecordPagesOrThrow } from '@/object-record/utils/fetchAllRecordPagesOrThrow';

const createPage = ({
  recordId,
  endCursor,
  hasNextPage,
  totalCount = 3,
}: {
  recordId: string;
  endCursor: string;
  hasNextPage?: boolean;
  totalCount?: number;
}): RecordGqlConnectionEdgesRequired => ({
  edges: [
    {
      __typename: 'RecordEdge',
      node: { __typename: 'Record', id: recordId },
      cursor: endCursor,
    },
  ],
  pageInfo: { endCursor, hasNextPage },
  totalCount,
});

const FIRST_PAGE = createPage({
  recordId: 'first',
  endCursor: 'first-cursor',
  hasNextPage: true,
});
const SECOND_PAGE = createPage({
  recordId: 'second',
  endCursor: 'second-cursor',
  hasNextPage: true,
});
const LAST_PAGE = createPage({
  recordId: 'last',
  endCursor: 'last-cursor',
  hasNextPage: false,
});

describe('fetchAllRecordPagesOrThrow', () => {
  it('follows all cursor pages even when the initial count is stale', async () => {
    const fetchNextPage = jest
      .fn()
      .mockResolvedValueOnce({ connection: SECOND_PAGE })
      .mockResolvedValueOnce({ connection: LAST_PAGE });
    const onPageFetched = jest.fn();

    const records = await fetchAllRecordPagesOrThrow({
      fetchFirstPage: async () => ({
        connection: { ...FIRST_PAGE, totalCount: 1 },
      }),
      fetchNextPage,
      maximumRequests: 3,
      pageSize: 1,
      delayMs: 0,
      shouldThrowOnIncompleteResult: true,
      onPageFetched,
    });

    expect(records.map(({ id }) => id)).toEqual(['first', 'second', 'last']);
    expect(fetchNextPage).toHaveBeenCalledTimes(2);
    expect(
      onPageFetched.mock.calls.map(
        ([progress]) => progress.processedRecordCount,
      ),
    ).toEqual([1, 2, 3]);
  });

  it('keeps count-based pagination for legacy responses without hasNextPage', async () => {
    const fetchNextPage = jest.fn(async () => ({ connection: LAST_PAGE }));

    const records = await fetchAllRecordPagesOrThrow({
      fetchFirstPage: async () => ({
        connection: createPage({
          recordId: 'first',
          endCursor: 'first-cursor',
          totalCount: 2,
        }),
      }),
      fetchNextPage,
      maximumRequests: 3,
      pageSize: 1,
      delayMs: 0,
    });

    expect(records.map(({ id }) => id)).toEqual(['first', 'last']);
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('propagates a later page failure instead of returning partial records', async () => {
    const error = new Error('Network unavailable');

    await expect(
      fetchAllRecordPagesOrThrow({
        fetchFirstPage: async () => ({ connection: FIRST_PAGE }),
        fetchNextPage: async () => ({ error }),
        maximumRequests: 3,
        pageSize: 1,
        delayMs: 0,
        shouldThrowOnIncompleteResult: true,
      }),
    ).rejects.toBe(error);
  });

  it('rejects a partial result when strict pagination reaches its request cap', async () => {
    const fetchNextPage = jest.fn(async () => ({ connection: SECOND_PAGE }));

    await expect(
      fetchAllRecordPagesOrThrow({
        fetchFirstPage: async () => ({ connection: FIRST_PAGE }),
        fetchNextPage,
        maximumRequests: 1,
        pageSize: 1,
        delayMs: 0,
        shouldThrowOnIncompleteResult: true,
      }),
    ).rejects.toBeInstanceOf(CustomError);
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('preserves the bounded partial result for legacy capped callers', async () => {
    const fetchNextPage = jest.fn(async () => ({ connection: SECOND_PAGE }));

    const records = await fetchAllRecordPagesOrThrow({
      fetchFirstPage: async () => ({ connection: FIRST_PAGE }),
      fetchNextPage,
      maximumRequests: 1,
      pageSize: 1,
      delayMs: 0,
    });

    expect(records.map(({ id }) => id)).toEqual(['first', 'second']);
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it.each([undefined, { connection: { ...LAST_PAGE, pageInfo: undefined } }])(
    'rejects a missing or incomplete first page in strict mode',
    async (firstPage) => {
      await expect(
        fetchAllRecordPagesOrThrow({
          fetchFirstPage: async () => firstPage,
          fetchNextPage: async () => ({ connection: LAST_PAGE }),
          maximumRequests: 3,
          pageSize: 1,
          delayMs: 0,
          shouldThrowOnIncompleteResult: true,
        }),
      ).rejects.toBeInstanceOf(CustomError);
    },
  );

  it('rejects a missing later page instead of treating it as completion', async () => {
    await expect(
      fetchAllRecordPagesOrThrow({
        fetchFirstPage: async () => ({ connection: FIRST_PAGE }),
        fetchNextPage: async () => undefined,
        maximumRequests: 3,
        pageSize: 1,
        delayMs: 0,
        shouldThrowOnIncompleteResult: true,
      }),
    ).rejects.toBeInstanceOf(CustomError);
  });

  it('rejects a repeated cursor before making another request', async () => {
    const fetchNextPage = jest.fn(async () => ({ connection: FIRST_PAGE }));

    await expect(
      fetchAllRecordPagesOrThrow({
        fetchFirstPage: async () => ({ connection: FIRST_PAGE }),
        fetchNextPage,
        maximumRequests: 3,
        pageSize: 1,
        delayMs: 0,
        shouldThrowOnIncompleteResult: true,
      }),
    ).rejects.toBeInstanceOf(CustomError);
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });
});
