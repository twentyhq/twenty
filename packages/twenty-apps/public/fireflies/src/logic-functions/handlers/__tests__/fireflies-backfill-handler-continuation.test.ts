import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FIREFLIES_BACKFILL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/fireflies-backfill-logic-function-universal-identifier.constant';
import { FIREFLIES_BACKFILL_CONTINUATION_BACKOFF_MILLISECONDS } from 'src/logic-functions/constants/fireflies-backfill-continuation-backoff-milliseconds.constant';
import { FIREFLIES_BACKFILL_CONTINUATION_RETRY_LIMIT } from 'src/logic-functions/constants/fireflies-backfill-continuation-retry-limit.constant';
import {
  answerTwentyQueries,
  buildGraphqlResponse,
  buildListedTranscript,
} from 'src/logic-functions/flows/__tests__/import-missing-fireflies-calls.test-support';
import { firefliesBackfillHandler } from 'src/logic-functions/handlers/fireflies-backfill-handler';
import { computeCallRecordingIdForFirefliesMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fireflies-meeting';

const queryMock = vi.hoisted(() => vi.fn());
const mutationMock = vi.hoisted(() => vi.fn());
const enqueueJobMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
    mutation = mutationMock;
  },
}));

vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJob: enqueueJobMock,
}));

const fetchMock = vi.fn();

const PAGE_SIZE = 50;
const CONTINUATION_CURSOR = {
  fromDate: '2026-05-01T00:00:00.000Z',
  toDate: '2026-07-30T00:00:00.000Z',
  skip: 50,
};

const fullPageOfImportedCalls = Array.from({ length: PAGE_SIZE }, (_, index) =>
  buildListedTranscript(
    `call-${index}`,
    Date.parse('2026-06-10T00:00:00.000Z') - index * 60_000,
  ),
);

describe('firefliesBackfillHandler continuation enqueue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('FIREFLIES_API_KEY', 'fireflies-api-key');
    enqueueJobMock.mockResolvedValue({
      enqueued: true,
      logicFunctionUniversalIdentifier:
        FIREFLIES_BACKFILL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    });
    answerTwentyQueries({
      queryMock,
      callRecordings: fullPageOfImportedCalls.map((firefliesCall) => ({
        id: computeCallRecordingIdForFirefliesMeeting(firefliesCall.id),
        transcript: [{ text: 'already imported' }],
        summary: { markdown: 'Already imported' },
      })),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('enqueues the next page cursor after completing a full page', async () => {
    fetchMock.mockResolvedValue(
      buildGraphqlResponse({ transcripts: fullPageOfImportedCalls }),
    );

    const result = await firefliesBackfillHandler({
      cursor: CONTINUATION_CURSOR,
    });

    expect(result).toEqual(
      expect.objectContaining({
        outcome: 'continuation-enqueued',
        isContinuationEnqueued: true,
      }),
    );
    expect(enqueueJobMock).toHaveBeenCalledWith({
      logicFunctionUniversalIdentifier:
        FIREFLIES_BACKFILL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: {
        cursor: {
          ...CONTINUATION_CURSOR,
          skip: CONTINUATION_CURSOR.skip + PAGE_SIZE,
        },
      },
      retryLimit: FIREFLIES_BACKFILL_CONTINUATION_RETRY_LIMIT,
    });
  });

  it('delays the continuation when Fireflies rate limits the list', async () => {
    fetchMock.mockResolvedValue(new Response('rate limited', { status: 429 }));

    const result = await firefliesBackfillHandler({
      cursor: CONTINUATION_CURSOR,
    });

    expect(result).toEqual(
      expect.objectContaining({
        outcome: 'rate-limited',
        isContinuationEnqueued: true,
      }),
    );
    expect(enqueueJobMock).toHaveBeenCalledWith({
      logicFunctionUniversalIdentifier:
        FIREFLIES_BACKFILL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: { cursor: CONTINUATION_CURSOR },
      retryLimit: FIREFLIES_BACKFILL_CONTINUATION_RETRY_LIMIT,
      delayMs: FIREFLIES_BACKFILL_CONTINUATION_BACKOFF_MILLISECONDS,
    });
  });

  it('reports a continuation that failed to enqueue', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    fetchMock.mockResolvedValue(
      buildGraphqlResponse({ transcripts: fullPageOfImportedCalls }),
    );
    enqueueJobMock.mockRejectedValue(new Error('connection refused'));

    const result = await firefliesBackfillHandler({
      cursor: CONTINUATION_CURSOR,
    });

    expect(result).toEqual(
      expect.objectContaining({
        outcome: 'continuation-enqueue-failed',
        isContinuationEnqueued: false,
      }),
    );
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
