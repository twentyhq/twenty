import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildFathomMeeting } from 'src/__tests__/utils/build-fathom-meeting.util';
import { buildFathomMeetingPages } from 'src/__tests__/utils/build-fathom-meeting-pages.util';
import { buildLogicFunctionExecutionContext } from 'src/__tests__/utils/logic-function-execution-context.util';
import { computeCallRecordingIdForFathomMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fathom-meeting.util';

const mocks = vi.hoisted(() => ({
  getRecordingSummary: vi.fn(),
  getRecordingTranscript: vi.fn(),
  listFathomConnectionsForRequest: vi.fn(),
  listMeetings: vi.fn(),
  mutation: vi.fn(),
  query: vi.fn(),
  syncFathomMeetingsToCallRecordings: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  jsonSchemaToInputSchema: () => [],
}));

vi.mock('fathom-typescript', () => ({
  Fathom: class Fathom {
    listMeetings = mocks.listMeetings;
    getRecordingTranscript = mocks.getRecordingTranscript;
    getRecordingSummary = mocks.getRecordingSummary;
  },
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class CoreApiClient {
    query = mocks.query;
    mutation = mocks.mutation;
  },
}));

vi.mock(
  'src/logic-functions/utils/list-fathom-connections-for-request.util',
  () => ({
    listFathomConnectionsForRequest: mocks.listFathomConnectionsForRequest,
  }),
);

vi.mock(
  'src/logic-functions/utils/sync-fathom-meetings-to-call-recordings.util',
  () => ({
    syncFathomMeetingsToCallRecordings:
      mocks.syncFathomMeetingsToCallRecordings,
  }),
);

const { fathomSyncCallHandler } =
  await import('src/logic-functions/fathom-sync-call');

const RECORDING_ID = 42;
const CALL_RECORDING_ID = computeCallRecordingIdForFathomMeeting(RECORDING_ID);
const CONTEXT = buildLogicFunctionExecutionContext('user-workspace-1');

const mockDeletedCallRecordingIds = (callRecordingIds: string[]) =>
  mocks.query.mockResolvedValue({
    callRecordings: {
      edges: callRecordingIds.map((id) => ({
        node: {
          id,
          updatedAt: '2026-08-20T11:00:00.000Z',
          deletedAt: '2026-08-21T00:00:00.000Z',
        },
      })),
    },
  });

describe('fathomSyncCallHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.listFathomConnectionsForRequest.mockResolvedValue([
      { id: 'connection-1', accessToken: 'token' },
    ]);
    mocks.listMeetings.mockImplementation(
      buildFathomMeetingPages([
        [buildFathomMeeting({ recordingId: RECORDING_ID })],
      ]),
    );
    mocks.getRecordingTranscript.mockResolvedValue({ transcript: [] });
    mocks.getRecordingSummary.mockResolvedValue({ summary: null });
    mocks.syncFathomMeetingsToCallRecordings.mockResolvedValue([
      { callRecordingId: CALL_RECORDING_ID, created: false },
    ]);
  });

  it('reports a recording the user deleted as skipped without recreating it', async () => {
    mockDeletedCallRecordingIds([CALL_RECORDING_ID]);

    expect(
      await fathomSyncCallHandler({ recordingId: RECORDING_ID }, CONTEXT),
    ).toEqual({
      success: true,
      recordingId: RECORDING_ID,
      callRecordingId: CALL_RECORDING_ID,
      skipped: true,
      reason: 'The call recording has been deleted',
    });
    expect(mocks.syncFathomMeetingsToCallRecordings).not.toHaveBeenCalled();
    expect(mocks.mutation).not.toHaveBeenCalled();
  });

  it('syncs a recording that was never deleted', async () => {
    mockDeletedCallRecordingIds([]);

    expect(
      await fathomSyncCallHandler({ recordingId: RECORDING_ID }, CONTEXT),
    ).toEqual({
      success: true,
      recordingId: RECORDING_ID,
      callRecordingId: CALL_RECORDING_ID,
      created: false,
    });
    expect(mocks.query).toHaveBeenCalledOnce();
    expect(mocks.syncFathomMeetingsToCallRecordings).toHaveBeenCalledOnce();
    expect(
      mocks.syncFathomMeetingsToCallRecordings.mock.calls[0][0],
    ).toMatchObject({ retryMedia: true, callRecordingSyncStates: new Map() });
  });
});
