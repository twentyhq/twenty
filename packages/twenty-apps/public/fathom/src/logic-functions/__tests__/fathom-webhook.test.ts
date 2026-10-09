import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FATHOM_WEBHOOK_CONNECTION_QUERY_PARAMETER } from 'src/constants/fathom.constant';
import { computeCallRecordingIdForFathomMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fathom-meeting.util';

const mocks = vi.hoisted(() => ({
  kvGet: vi.fn(),
  mutation: vi.fn(),
  query: vi.fn(),
  syncFathomMeetingsToCallRecordings: vi.fn(),
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
  'src/logic-functions/utils/sync-fathom-meetings-to-call-recordings.util',
  () => ({
    syncFathomMeetingsToCallRecordings:
      mocks.syncFathomMeetingsToCallRecordings,
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

const COMPLETED_CALL_RECORDING_NODE = {
  id: CALL_RECORDING_ID,
  updatedAt: '2026-08-20T11:00:00.000Z',
  status: 'COMPLETED',
  recordingRequestStatus: 'REQUESTED',
  startedAt: '2026-08-20T10:00:00.000Z',
  endedAt: '2026-08-20T10:30:00.000Z',
  video: [{ fileId: 'video-file-id' }],
  transcript: [{ participant: { name: 'Owner' }, words: [] }],
  summary: { markdown: 'Summary', blocknote: null },
  fathomRecordingImports: {
    edges: [
      {
        node: { id: CALL_RECORDING_ID, updatedAt: '2026-08-20T11:00:00.000Z' },
      },
    ],
  },
};

const mockCallRecordingNodes = (nodes: Record<string, unknown>[]) =>
  mocks.query.mockResolvedValue({
    callRecordings: { edges: nodes.map((node) => ({ node })) },
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
    mocks.syncFathomMeetingsToCallRecordings.mockResolvedValue([
      { callRecordingId: CALL_RECORDING_ID, created: true },
    ]);
  });

  it('acknowledges a recording the user deleted without recreating it', async () => {
    mockCallRecordingNodes([
      {
        ...COMPLETED_CALL_RECORDING_NODE,
        deletedAt: '2026-08-21T00:00:00.000Z',
      },
    ]);

    expect(await fathomWebhookHandler(ROUTE_PAYLOAD)).toEqual({
      success: true,
      skipped: true,
      reason: 'The call recording has been deleted',
    });
    expect(mocks.syncFathomMeetingsToCallRecordings).not.toHaveBeenCalled();
    expect(mocks.mutation).not.toHaveBeenCalled();
  });

  it('acknowledges a replayed recording that is already complete with a single read', async () => {
    mockCallRecordingNodes([COMPLETED_CALL_RECORDING_NODE]);

    expect(await fathomWebhookHandler(ROUTE_PAYLOAD)).toEqual({
      success: true,
      skipped: true,
      reason: 'The call recording is already up to date',
    });
    expect(mocks.query).toHaveBeenCalledOnce();
    expect(mocks.syncFathomMeetingsToCallRecordings).not.toHaveBeenCalled();
    expect(mocks.mutation).not.toHaveBeenCalled();
  });

  it('syncs a new recording without reading its state twice', async () => {
    mockCallRecordingNodes([]);

    expect(await fathomWebhookHandler(ROUTE_PAYLOAD)).toEqual({
      success: true,
      callRecordingId: CALL_RECORDING_ID,
      created: true,
    });
    expect(mocks.query).toHaveBeenCalledOnce();
    expect(mocks.syncFathomMeetingsToCallRecordings).toHaveBeenCalledOnce();
    expect(
      mocks.syncFathomMeetingsToCallRecordings.mock.calls[0][0],
    ).toMatchObject({
      connectedAccountId: 'connection-1',
      meetings: [expect.objectContaining({ recordingId: RECORDING_ID })],
      callRecordingSyncStates: new Map(),
    });
  });
});
