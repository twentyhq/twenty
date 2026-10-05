import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CALL_RECORDING_STATUS } from 'src/logic-functions/constants/call-recording-status.constant';
import {
  answerTwentyQueries,
  buildGraphqlResponse,
} from 'src/logic-functions/flows/__tests__/import-missing-fireflies-calls.test-support';
import { firefliesWebhookHandler } from 'src/logic-functions/handlers/fireflies-webhook-handler';

const queryMock = vi.hoisted(() => vi.fn());
const mutationMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
    mutation = mutationMock;
  },
}));

describe('firefliesWebhookHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('FIREFLIES_API_KEY', 'fireflies-api-key');
    answerTwentyQueries({ queryMock });
    mutationMock.mockResolvedValue({
      createCallRecording: { id: 'created' },
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('keeps a summary-only webhook recording processing until its transcript arrives', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        buildGraphqlResponse({
          transcript: {
            id: 'summary-first-call',
            title: 'Summary first call',
            date: Date.parse('2026-06-02T10:00:00.000Z'),
            duration: 30,
            meeting_link: null,
            participants: ['a@example.com'],
            organizer_email: 'a@example.com',
            calendar_id: null,
            cal_id: null,
            calendar_type: null,
            meeting_info: { summary_status: 'processed' },
            summary: { overview: 'Summary arrived first' },
          },
        }),
      ),
    );

    await firefliesWebhookHandler({
      meetingId: 'summary-first-call',
      eventType: 'meeting.summarized',
    });

    expect(mutationMock).toHaveBeenCalledWith({
      createCallRecording: {
        __args: {
          data: expect.objectContaining({
            status: CALL_RECORDING_STATUS.PROCESSING,
            summary: expect.objectContaining({
              markdown: expect.stringContaining('Summary arrived first'),
            }),
          }),
        },
        id: true,
      },
    });
  });
});
