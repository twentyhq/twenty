import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildGraphqlResponse,
  buildListedTranscript,
  FIREFLIES_API_KEY,
  FIREFLIES_BACKFILL_FROM_DATE,
  getListRequestVariables,
  INITIAL_FIREFLIES_BACKFILL_CURSOR,
  serveFirefliesApi,
  setUpImportMissingFirefliesCallsTest,
  skipSleep,
} from 'src/logic-functions/flows/__tests__/import-missing-fireflies-calls.test-support';
import { importMissingFirefliesCalls } from 'src/logic-functions/flows/import-missing-fireflies-calls.util';

const queryMock = vi.hoisted(() => vi.fn());
const mutationMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
    mutation = mutationMock;
  },
}));

const fetchMock = vi.fn();

describe('importMissingFirefliesCalls pagination', () => {
  beforeEach(() => {
    setUpImportMissingFirefliesCallsTest({
      fetchMock,
      queryMock,
      mutationMock,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('preserves the cursor date window when a continuation resumes', async () => {
    const continuationCursor = {
      fromDate: FIREFLIES_BACKFILL_FROM_DATE,
      toDate: '2026-07-30T00:00:00.000Z',
      skip: 50,
    };

    serveFirefliesApi([[]], fetchMock);

    const { CoreApiClient } = await import('twenty-client-sdk/core');

    await importMissingFirefliesCalls({
      apiKey: FIREFLIES_API_KEY,
      coreApiClient: new CoreApiClient(),
      cursor: continuationCursor,
      sleep: skipSleep,
    });

    expect(getListRequestVariables(fetchMock)).toEqual([
      {
        fromDate: continuationCursor.fromDate,
        toDate: continuationCursor.toDate,
        limit: 50,
        skip: continuationCursor.skip,
      },
    ]);
  });

  it('returns the next page cursor after a full page', async () => {
    const pageSize = 50;
    const newestCallDateMilliseconds = Date.parse('2026-06-10T00:00:00.000Z');
    const initialCursor = {
      fromDate: FIREFLIES_BACKFILL_FROM_DATE,
      toDate: '2026-06-11T00:00:00.000Z',
      skip: 0,
    };
    const fullPage = Array.from({ length: pageSize }, (_, index) =>
      buildListedTranscript(
        `call-${index}`,
        newestCallDateMilliseconds - index * 60_000,
      ),
    );

    serveFirefliesApi([fullPage], fetchMock);

    const { CoreApiClient } = await import('twenty-client-sdk/core');
    const result = await importMissingFirefliesCalls({
      apiKey: FIREFLIES_API_KEY,
      coreApiClient: new CoreApiClient(),
      cursor: initialCursor,
      sleep: skipSleep,
    });

    expect(result).toEqual(
      expect.objectContaining({
        stopReason: 'page-complete',
        importedCallCount: pageSize,
        continuationCursor: {
          ...initialCursor,
          skip: pageSize,
        },
      }),
    );
    expect(getListRequestVariables(fetchMock)).toHaveLength(1);
  });

  it('returns the current page cursor without pausing after list rate limiting', async () => {
    const cursor = {
      fromDate: FIREFLIES_BACKFILL_FROM_DATE,
      toDate: '2026-06-05T00:00:00.000Z',
      skip: 50,
    };

    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ errors: [{ message: 'too many requests' }] }),
        { status: 429 },
      ),
    );

    const sleep = vi.fn().mockResolvedValue(undefined);
    const { CoreApiClient } = await import('twenty-client-sdk/core');
    const result = await importMissingFirefliesCalls({
      apiKey: FIREFLIES_API_KEY,
      coreApiClient: new CoreApiClient(),
      cursor,
      sleep,
    });

    expect(result).toEqual(
      expect.objectContaining({
        stopReason: 'rate-limited',
        continuationCursor: cursor,
      }),
    );
    expect(sleep).not.toHaveBeenCalled();
  });

  it('returns the current page cursor after a hard list failure', async () => {
    const cursor = {
      fromDate: FIREFLIES_BACKFILL_FROM_DATE,
      toDate: '2026-06-05T00:00:00.000Z',
      skip: 100,
    };

    fetchMock.mockResolvedValue(
      new Response('invalid request', { status: 400 }),
    );

    const { CoreApiClient } = await import('twenty-client-sdk/core');
    const result = await importMissingFirefliesCalls({
      apiKey: FIREFLIES_API_KEY,
      coreApiClient: new CoreApiClient(),
      cursor,
      sleep: skipSleep,
    });

    expect(result).toEqual(
      expect.objectContaining({
        stopReason: 'list-failed',
        continuationCursor: cursor,
        listErrorMessage: expect.stringContaining('HTTP 400'),
      }),
    );
  });

  it('returns the current page cursor after a persistent Fireflies server error', async () => {
    const cursor = {
      fromDate: FIREFLIES_BACKFILL_FROM_DATE,
      toDate: '2026-06-05T00:00:00.000Z',
      skip: 100,
    };

    fetchMock.mockImplementation(
      async () => new Response('server error', { status: 500 }),
    );

    const { CoreApiClient } = await import('twenty-client-sdk/core');
    const result = await importMissingFirefliesCalls({
      apiKey: FIREFLIES_API_KEY,
      coreApiClient: new CoreApiClient(),
      cursor,
      sleep: skipSleep,
    });

    expect(result).toEqual(
      expect.objectContaining({
        stopReason: 'retryable-error',
        continuationCursor: cursor,
      }),
    );
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('uses offsets across continuations when calls share the same timestamp', async () => {
    const pageSize = 50;
    const sharedCallDateMilliseconds = Date.parse('2026-06-10T00:00:00.000Z');
    const firefliesCalls = Array.from({ length: pageSize + 1 }, (_, index) =>
      buildListedTranscript(`call-${index}`, sharedCallDateMilliseconds),
    );

    fetchMock.mockImplementation(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body)) as {
        query: string;
        variables: {
          limit?: number;
          skip?: number;
          toDate?: string;
          transcriptId?: string;
        };
      };

      if (body.query.includes('query Transcripts(')) {
        const firefliesCallsBeforeUpperBound = body.variables.toDate
          ? firefliesCalls.filter(
              (firefliesCall) =>
                firefliesCall.date < Date.parse(body.variables.toDate ?? ''),
            )
          : firefliesCalls;
        const skip = body.variables.skip ?? 0;
        const limit = body.variables.limit ?? pageSize;

        return buildGraphqlResponse({
          transcripts: firefliesCallsBeforeUpperBound.slice(skip, skip + limit),
        });
      }

      return buildGraphqlResponse({
        transcript: {
          id: body.variables.transcriptId,
          title: 'Call detail',
          date: sharedCallDateMilliseconds,
          duration: 30,
          meeting_link: null,
          participants: ['a@example.com'],
          organizer_email: 'a@example.com',
          calendar_id: null,
          cal_id: null,
          calendar_type: null,
          sentences: body.query.includes('sentences {')
            ? [
                {
                  speaker_name: 'A',
                  text: 'hello',
                  start_time: 0,
                  end_time: 1,
                },
              ]
            : undefined,
          summary: null,
        },
      });
    });

    const { CoreApiClient } = await import('twenty-client-sdk/core');
    const firstPageResult = await importMissingFirefliesCalls({
      apiKey: FIREFLIES_API_KEY,
      coreApiClient: new CoreApiClient(),
      cursor: INITIAL_FIREFLIES_BACKFILL_CURSOR,
      sleep: skipSleep,
    });

    expect(firstPageResult).toEqual(
      expect.objectContaining({
        stopReason: 'page-complete',
        importedCallCount: pageSize,
        continuationCursor: {
          ...INITIAL_FIREFLIES_BACKFILL_CURSOR,
          skip: pageSize,
        },
      }),
    );

    if (firstPageResult.stopReason !== 'page-complete') {
      throw new Error('Expected a page-complete continuation');
    }

    const secondPageResult = await importMissingFirefliesCalls({
      apiKey: FIREFLIES_API_KEY,
      coreApiClient: new CoreApiClient(),
      cursor: firstPageResult.continuationCursor,
      sleep: skipSleep,
    });

    expect(secondPageResult).toEqual(
      expect.objectContaining({
        stopReason: 'exhausted',
        importedCallCount: 1,
      }),
    );
    expect(mutationMock).toHaveBeenCalledTimes(pageSize + 1);
    expect(getListRequestVariables(fetchMock).map(({ skip }) => skip)).toEqual([
      0,
      pageSize,
    ]);
  });
});
