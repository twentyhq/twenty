import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CALL_RECORDING_STATUS } from 'src/logic-functions/constants/call-recording-status.constant';
import {
  answerTwentyQueries,
  buildGraphqlResponse,
  FIREFLIES_API_KEY,
  FIREFLIES_BACKFILL_FROM_DATE,
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

describe('importMissingFirefliesCalls retries', () => {
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

  it('aborts the batch on a Fireflies rate limit', async () => {
    fetchMock.mockImplementation(
      async () =>
        new Response(
          JSON.stringify({ errors: [{ message: 'too many requests' }] }),
          { status: 429 },
        ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const { CoreApiClient } = await import('twenty-client-sdk/core');
    const result = await importMissingFirefliesCalls({
      apiKey: FIREFLIES_API_KEY,
      coreApiClient: new CoreApiClient(),
      transcriptIds: ['call-newer', 'call-older'],
      sleep: skipSleep,
    });

    expect(result).toEqual({
      status: 'retryable-error',
      importedCallCount: 0,
      erroredCallCount: 0,
      skippedCallCount: 0,
    });
  });

  it('keeps the counts of calls synced before a rate limit aborts the batch', async () => {
    let isFirstCall = true;

    fetchMock.mockImplementation(async () => {
      if (isFirstCall) {
        isFirstCall = false;

        return buildGraphqlResponse({
          transcript: {
            id: 'call-1',
            title: 'Call 1',
            date: Date.parse(FIREFLIES_BACKFILL_FROM_DATE),
            duration: 30,
            meeting_link: null,
            participants: ['a@example.com'],
            organizer_email: 'a@example.com',
            calendar_id: null,
            cal_id: null,
            calendar_type: null,
            sentences: [
              { speaker_name: 'A', text: 'hello', start_time: 0, end_time: 1 },
            ],
            summary: { overview: 'Summary' },
          },
        });
      }

      return new Response(
        JSON.stringify({ errors: [{ message: 'too many requests' }] }),
        { status: 429 },
      );
    });
    vi.stubGlobal('fetch', fetchMock);
    answerTwentyQueries({
      queryMock,
      callRecordings: [
        {
          id: computeCallRecordingIdForFirefliesMeeting('call-1'),
          status: CALL_RECORDING_STATUS.PROCESSING,
          transcript: null,
          summary: { markdown: 'Already imported' },
        },
      ],
    });

    const { CoreApiClient } = await import('twenty-client-sdk/core');
    const result = await importMissingFirefliesCalls({
      apiKey: FIREFLIES_API_KEY,
      coreApiClient: new CoreApiClient(),
      transcriptIds: ['call-1', 'call-2'],
      sleep: skipSleep,
    });

    expect(result).toEqual({
      status: 'retryable-error',
      importedCallCount: 1,
      erroredCallCount: 0,
      skippedCallCount: 0,
    });
  });

  it('aborts the batch on a persistent Fireflies server error', async () => {
    fetchMock.mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            errors: [
              {
                message: 'Temporary Fireflies failure',
                extensions: { code: 'invariant_violation' },
              },
            ],
          }),
          { status: 200 },
        ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const { CoreApiClient } = await import('twenty-client-sdk/core');
    const result = await importMissingFirefliesCalls({
      apiKey: FIREFLIES_API_KEY,
      coreApiClient: new CoreApiClient(),
      transcriptIds: ['call-with-server-error'],
      sleep: skipSleep,
    });

    expect(result).toEqual({
      status: 'retryable-error',
      importedCallCount: 0,
      erroredCallCount: 0,
      skippedCallCount: 0,
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
