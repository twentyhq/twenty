import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CALL_RECORDING_STATUS } from 'src/logic-functions/constants/call-recording-status.constant';
import {
  answerTwentyQueries,
  buildGraphqlResponse,
} from 'src/logic-functions/flows/__tests__/import-missing-fireflies-calls.test-support';
import { computeCallRecordingIdForFirefliesMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fireflies-meeting';
import { syncFirefliesCallToCallRecording } from 'src/logic-functions/utils/sync-fireflies-call-to-call-recording.util';

const queryMock = vi.hoisted(() => vi.fn());
const mutationMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
    mutation = mutationMock;
  },
}));

describe('syncFirefliesCallToCallRecording', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutationMock.mockResolvedValue({
      updateCallRecording: { id: 'updated' },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('completes the recording when the opposite field arrives after its state snapshot', async () => {
    const transcriptId = 'concurrent-webhook-call';
    const callRecordingId =
      computeCallRecordingIdForFirefliesMeeting(transcriptId);

    answerTwentyQueries({
      queryMock,
      callRecordings: [
        {
          id: callRecordingId,
          status: CALL_RECORDING_STATUS.PROCESSING,
          transcript: [{ text: 'Transcript arrived concurrently' }],
          summary: { markdown: 'Stored summary' },
        },
      ],
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        buildGraphqlResponse({
          transcript: {
            id: transcriptId,
            title: 'Concurrent webhook call',
            date: Date.parse('2026-06-02T10:00:00.000Z'),
            duration: 30,
            meeting_link: null,
            participants: ['a@example.com'],
            organizer_email: 'a@example.com',
            calendar_id: null,
            cal_id: null,
            calendar_type: null,
            meeting_info: { summary_status: 'processed' },
            summary: { overview: 'Summary arrived concurrently' },
          },
        }),
      ),
    );

    const { CoreApiClient } = await import('twenty-client-sdk/core');

    await syncFirefliesCallToCallRecording({
      apiKey: 'fireflies-api-key',
      coreApiClient: new CoreApiClient(),
      transcriptId,
      field: 'summary',
      callRecordingFieldState: {
        isTranscriptFilled: false,
        isSummaryFilled: false,
        status: CALL_RECORDING_STATUS.PROCESSING,
      },
    });

    expect(mutationMock).toHaveBeenCalledWith({
      updateCallRecording: {
        __args: {
          id: callRecordingId,
          data: { status: CALL_RECORDING_STATUS.COMPLETED },
        },
        id: true,
      },
    });
  });
});
