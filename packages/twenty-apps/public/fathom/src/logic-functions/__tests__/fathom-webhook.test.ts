import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FATHOM_WEBHOOK_CONNECTION_QUERY_PARAMETER } from 'src/constants/fathom.constant';
import { computeCallRecordingIdForFathomMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fathom-meeting.util';

const mocks = vi.hoisted(() => ({
  kvGet: vi.fn(),
  mutation: vi.fn(),
  query: vi.fn(),
  syncFathomMeetingToCallRecording: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: mocks.kvGet },
}));

vi.mock('fathom-typescript', () => ({
  Fathom: class Fathom {
    static verifyWebhook = () => undefined;
  },
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class CoreApiClient {
    query = mocks.query;
    mutation = mocks.mutation;
  },
}));

vi.mock(
  'src/logic-functions/utils/sync-fathom-meeting-to-call-recording.util',
  () => ({
    syncFathomMeetingToCallRecording: mocks.syncFathomMeetingToCallRecording,
  }),
);

const { fathomWebhookHandler } =
  await import('src/logic-functions/fathom-webhook');

const RECORDING_ID = 42;
const CALL_RECORDING_ID = computeCallRecordingIdForFathomMeeting(RECORDING_ID);

const MEETING_BODY = JSON.stringify({
  title: 'Customer call',
  meeting_title: 'Customer call',
  meeting_type: null,
  recording_id: RECORDING_ID,
  url: `https://fathom.video/calls/${RECORDING_ID}`,
  share_url: `https://fathom.video/share/${RECORDING_ID}`,
  created_at: '2026-08-20T10:00:00.000Z',
  scheduled_start_time: '2026-08-20T10:00:00.000Z',
  scheduled_end_time: '2026-08-20T10:30:00.000Z',
  recording_start_time: '2026-08-20T10:00:00.000Z',
  recording_end_time: '2026-08-20T10:30:00.000Z',
  calendar_invitees_domains_type: 'one_or_more_external',
  shared_with: 'single_team',
  transcript_language: 'en',
  calendar_invitees: [],
  recorded_by: {
    name: 'Owner',
    email: 'owner@example.com',
    email_domain: 'example.com',
    team: null,
  },
});

const ROUTE_PAYLOAD = {
  queryStringParameters: {
    [FATHOM_WEBHOOK_CONNECTION_QUERY_PARAMETER]: 'connection-1',
  },
  headers: {
    'webhook-id': 'message-1',
    'webhook-timestamp': '1787220000',
    'webhook-signature': 'v1,signature',
  },
  rawBody: MEETING_BODY,
} as unknown as Parameters<typeof fathomWebhookHandler>[0];

const mockDeletedCallRecordingIds = (callRecordingIds: string[]) =>
  mocks.query.mockResolvedValue({
    callRecordings: {
      edges: callRecordingIds.map((id) => ({ node: { id } })),
    },
  });

describe('fathomWebhookHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.kvGet.mockResolvedValue({
      webhookId: 'webhook-1',
      secret: 'secret',
      isActive: true,
      isInitialBackfillEnqueued: true,
    });
    mocks.syncFathomMeetingToCallRecording.mockResolvedValue({
      callRecordingId: CALL_RECORDING_ID,
      created: true,
    });
  });

  it('acknowledges a recording the user deleted without recreating it', async () => {
    mockDeletedCallRecordingIds([CALL_RECORDING_ID]);

    expect(await fathomWebhookHandler(ROUTE_PAYLOAD)).toEqual({
      success: true,
      skipped: true,
      reason: 'The call recording has been deleted',
    });
    expect(mocks.syncFathomMeetingToCallRecording).not.toHaveBeenCalled();
    expect(mocks.mutation).not.toHaveBeenCalled();
  });

  it('syncs a recording that was never deleted', async () => {
    mockDeletedCallRecordingIds([]);

    expect(await fathomWebhookHandler(ROUTE_PAYLOAD)).toEqual({
      success: true,
      callRecordingId: CALL_RECORDING_ID,
      created: true,
    });
    expect(mocks.syncFathomMeetingToCallRecording).toHaveBeenCalledWith(
      expect.objectContaining({ connectedAccountId: 'connection-1' }),
    );
  });
});
