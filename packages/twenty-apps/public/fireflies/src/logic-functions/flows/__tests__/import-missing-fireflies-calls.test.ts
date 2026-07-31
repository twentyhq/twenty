import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CALL_RECORDING_STATUS } from 'src/logic-functions/constants/call-recording-status.constant';
import {
  answerTwentyQueries,
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
import { computeCallRecordingIdForFirefliesMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fireflies-meeting';

const queryMock = vi.hoisted(() => vi.fn());
const mutationMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
    mutation = mutationMock;
  },
}));

const fetchMock = vi.fn();

describe('importMissingFirefliesCalls synchronization', () => {
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

  it('imports every call when one short page covers the window', async () => {
    serveFirefliesApi(
      [
        [
          buildListedTranscript(
            'call-1',
            Date.parse('2026-06-02T10:00:00.000Z'),
          ),
          buildListedTranscript(
            'call-2',
            Date.parse('2026-06-01T10:00:00.000Z'),
          ),
        ],
      ],
      fetchMock,
    );

    const { CoreApiClient } = await import('twenty-client-sdk/core');
    const result = await importMissingFirefliesCalls({
      apiKey: FIREFLIES_API_KEY,
      coreApiClient: new CoreApiClient(),
      cursor: INITIAL_FIREFLIES_BACKFILL_CURSOR,
      sleep: skipSleep,
    });

    expect(result).toEqual(
      expect.objectContaining({
        stopReason: 'exhausted',
        importedCallCount: 2,
        erroredCallCount: 0,
      }),
    );
    expect(mutationMock).toHaveBeenCalledTimes(2);
  });

  it('keeps a call recording processing while its Fireflies summary is pending', async () => {
    serveFirefliesApi(
      [
        [
          buildListedTranscript(
            'call-with-pending-summary',
            Date.parse('2026-06-02T10:00:00.000Z'),
          ),
        ],
      ],
      fetchMock,
    );

    const { CoreApiClient } = await import('twenty-client-sdk/core');

    await importMissingFirefliesCalls({
      apiKey: FIREFLIES_API_KEY,
      coreApiClient: new CoreApiClient(),
      cursor: INITIAL_FIREFLIES_BACKFILL_CURSOR,
      sleep: skipSleep,
    });

    expect(mutationMock).toHaveBeenCalledWith({
      createCallRecording: {
        __args: {
          data: expect.objectContaining({
            status: CALL_RECORDING_STATUS.PROCESSING,
            transcript: expect.any(Array),
          }),
        },
        id: true,
      },
    });
  });

  it('skips complete calls without fetching Fireflies details', async () => {
    serveFirefliesApi(
      [
        [
          buildListedTranscript(
            'call-1',
            Date.parse('2026-06-02T10:00:00.000Z'),
          ),
          buildListedTranscript(
            'call-2',
            Date.parse('2026-06-01T10:00:00.000Z'),
          ),
        ],
      ],
      fetchMock,
    );
    answerTwentyQueries({
      queryMock,
      callRecordings: ['call-1', 'call-2'].map((callId) => ({
        id: computeCallRecordingIdForFirefliesMeeting(callId),
        transcript: [{ text: 'already imported' }],
        summary: { markdown: 'Already imported' },
      })),
    });

    const { CoreApiClient } = await import('twenty-client-sdk/core');
    const result = await importMissingFirefliesCalls({
      apiKey: FIREFLIES_API_KEY,
      coreApiClient: new CoreApiClient(),
      cursor: INITIAL_FIREFLIES_BACKFILL_CURSOR,
      sleep: skipSleep,
    });

    expect(result).toEqual(
      expect.objectContaining({
        stopReason: 'exhausted',
        importedCallCount: 0,
        skippedCallCount: 2,
      }),
    );
    expect(mutationMock).not.toHaveBeenCalled();
    expect(getListRequestVariables(fetchMock)).toHaveLength(
      fetchMock.mock.calls.length,
    );
  });

  it('returns the current call cursor after a detail rate limit', async () => {
    const cursor = {
      fromDate: FIREFLIES_BACKFILL_FROM_DATE,
      toDate: '2026-06-03T00:00:00.000Z',
      skip: 0,
    };

    fetchMock.mockImplementation(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body)) as { query: string };

      if (body.query.includes('query Transcripts(')) {
        return buildGraphqlResponse({
          transcripts: [
            buildListedTranscript(
              'call-newer',
              Date.parse('2026-06-02T10:00:00.000Z'),
            ),
            buildListedTranscript(
              'call-older',
              Date.parse('2026-06-01T10:00:00.000Z'),
            ),
          ],
        });
      }

      return new Response(
        JSON.stringify({ errors: [{ message: 'too many requests' }] }),
        { status: 429 },
      );
    });

    const { CoreApiClient } = await import('twenty-client-sdk/core');
    const result = await importMissingFirefliesCalls({
      apiKey: FIREFLIES_API_KEY,
      coreApiClient: new CoreApiClient(),
      cursor,
      sleep: skipSleep,
    });

    expect(result).toEqual(
      expect.objectContaining({
        stopReason: 'rate-limited',
        continuationCursor: cursor,
        importedCallCount: 0,
      }),
    );
  });

  it('returns the current call cursor after a persistent Fireflies server error', async () => {
    const cursor = {
      fromDate: FIREFLIES_BACKFILL_FROM_DATE,
      toDate: '2026-06-03T00:00:00.000Z',
      skip: 0,
    };

    fetchMock.mockImplementation(async (_url: string, init: RequestInit) => {
      const body: { query: string } = JSON.parse(String(init.body));

      if (body.query.includes('query Transcripts(')) {
        return buildGraphqlResponse({
          transcripts: [
            buildListedTranscript(
              'call-with-server-error',
              Date.parse('2026-06-02T10:00:00.000Z'),
            ),
          ],
        });
      }

      return new Response(
        JSON.stringify({
          errors: [
            {
              message: 'Temporary Fireflies failure',
              extensions: { code: 'invariant_violation' },
            },
          ],
        }),
        { status: 200 },
      );
    });

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
        importedCallCount: 0,
      }),
    );
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('syncs only the missing field of a partial call recording', async () => {
    const callId = 'partially-imported-call';
    const callRecordingId = computeCallRecordingIdForFirefliesMeeting(callId);
    const callDateMilliseconds = Date.parse('2026-06-02T10:00:00.000Z');
    let summaryRequestCount = 0;
    let transcriptRequestCount = 0;

    fetchMock.mockImplementation(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body)) as { query: string };

      if (body.query.includes('query Transcripts(')) {
        return buildGraphqlResponse({
          transcripts: [buildListedTranscript(callId, callDateMilliseconds)],
        });
      }

      if (body.query.includes('sentences {')) {
        transcriptRequestCount += 1;
      }

      summaryRequestCount += 1;

      return buildGraphqlResponse({
        transcript: {
          id: callId,
          title: 'Partially imported call',
          date: callDateMilliseconds,
          duration: 30,
          meeting_link: null,
          participants: ['a@example.com'],
          organizer_email: 'a@example.com',
          calendar_id: null,
          cal_id: null,
          calendar_type: null,
          summary: { overview: 'Recovered summary' },
        },
      });
    });
    answerTwentyQueries({
      queryMock,
      callRecordings: [
        {
          id: callRecordingId,
          status: 'COMPLETED',
          transcript: [{ text: 'Already imported' }],
          summary: null,
        },
      ],
    });

    const { CoreApiClient } = await import('twenty-client-sdk/core');
    const result = await importMissingFirefliesCalls({
      apiKey: FIREFLIES_API_KEY,
      coreApiClient: new CoreApiClient(),
      cursor: INITIAL_FIREFLIES_BACKFILL_CURSOR,
      sleep: skipSleep,
    });

    expect(result).toEqual(
      expect.objectContaining({
        stopReason: 'exhausted',
        importedCallCount: 1,
      }),
    );
    expect(transcriptRequestCount).toBe(0);
    expect(summaryRequestCount).toBe(1);
    expect(mutationMock).toHaveBeenCalledWith({
      updateCallRecording: {
        __args: {
          id: callRecordingId,
          data: expect.objectContaining({
            status: CALL_RECORDING_STATUS.COMPLETED,
            summary: expect.objectContaining({
              markdown: expect.stringContaining('Recovered summary'),
            }),
          }),
        },
        id: true,
      },
    });
  });

  it('moves a completed legacy recording back to processing while its summary is pending', async () => {
    const callId = 'legacy-transcript-only-call';
    const callRecordingId = computeCallRecordingIdForFirefliesMeeting(callId);
    const callDateMilliseconds = Date.parse('2026-06-02T10:00:00.000Z');

    fetchMock.mockImplementation(async (_url: string, init: RequestInit) => {
      const body: { query: string } = JSON.parse(String(init.body));

      if (body.query.includes('query Transcripts(')) {
        return buildGraphqlResponse({
          transcripts: [buildListedTranscript(callId, callDateMilliseconds)],
        });
      }

      return buildGraphqlResponse({
        transcript: {
          id: callId,
          title: 'Legacy transcript-only call',
          date: callDateMilliseconds,
          duration: 30,
          meeting_link: null,
          participants: ['a@example.com'],
          organizer_email: 'a@example.com',
          calendar_id: null,
          cal_id: null,
          calendar_type: null,
          summary: null,
          meeting_info: { summary_status: 'processing' },
        },
      });
    });
    answerTwentyQueries({
      queryMock,
      callRecordings: [
        {
          id: callRecordingId,
          status: CALL_RECORDING_STATUS.COMPLETED,
          transcript: [{ text: 'Already imported' }],
          summary: null,
        },
      ],
    });

    const { CoreApiClient } = await import('twenty-client-sdk/core');

    await importMissingFirefliesCalls({
      apiKey: FIREFLIES_API_KEY,
      coreApiClient: new CoreApiClient(),
      cursor: INITIAL_FIREFLIES_BACKFILL_CURSOR,
      sleep: skipSleep,
    });

    expect(mutationMock).toHaveBeenCalledWith({
      updateCallRecording: {
        __args: {
          id: callRecordingId,
          data: expect.objectContaining({
            status: CALL_RECORDING_STATUS.PROCESSING,
          }),
        },
        id: true,
      },
    });
  });

  it('keeps a transcript processing when Fireflies skips summary generation', async () => {
    const callId = 'call-with-skipped-summary';
    const callRecordingId = computeCallRecordingIdForFirefliesMeeting(callId);
    const callDateMilliseconds = Date.parse('2026-06-02T10:00:00.000Z');

    fetchMock.mockImplementation(async (_url: string, init: RequestInit) => {
      const body: { query: string } = JSON.parse(String(init.body));

      if (body.query.includes('query Transcripts(')) {
        return buildGraphqlResponse({
          transcripts: [buildListedTranscript(callId, callDateMilliseconds)],
        });
      }

      return buildGraphqlResponse({
        transcript: {
          id: callId,
          title: 'Call with skipped summary',
          date: callDateMilliseconds,
          duration: 30,
          meeting_link: null,
          participants: ['a@example.com'],
          organizer_email: 'a@example.com',
          calendar_id: null,
          cal_id: null,
          calendar_type: null,
          summary: null,
          meeting_info: { summary_status: 'skipped' },
        },
      });
    });
    answerTwentyQueries({
      queryMock,
      callRecordings: [
        {
          id: callRecordingId,
          status: CALL_RECORDING_STATUS.PROCESSING,
          transcript: [{ text: 'Already imported' }],
          summary: null,
        },
      ],
    });

    const { CoreApiClient } = await import('twenty-client-sdk/core');

    await importMissingFirefliesCalls({
      apiKey: FIREFLIES_API_KEY,
      coreApiClient: new CoreApiClient(),
      cursor: INITIAL_FIREFLIES_BACKFILL_CURSOR,
      sleep: skipSleep,
    });

    expect(mutationMock).not.toHaveBeenCalled();
  });
});
