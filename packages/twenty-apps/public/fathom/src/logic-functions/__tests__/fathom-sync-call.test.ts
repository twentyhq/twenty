import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildFathomMeeting } from 'src/__tests__/utils/build-fathom-meeting.util';
import { buildFathomMeetingPages } from 'src/__tests__/utils/build-fathom-meeting-pages.util';
import { buildLogicFunctionExecutionContext } from 'src/__tests__/utils/logic-function-execution-context.util';

const mocks = vi.hoisted(() => ({
  getRecordingSummary: vi.fn(),
  getRecordingTranscript: vi.fn(),
  listFathomConnectionsForRequest: vi.fn(),
  listMeetings: vi.fn(),
  syncFathomMeetingToCallRecording: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  jsonSchemaToInputSchema: () => [],
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class CoreApiClient {},
}));

vi.mock('fathom-typescript', () => ({
  Fathom: class Fathom {
    listMeetings = mocks.listMeetings;
    getRecordingTranscript = mocks.getRecordingTranscript;
    getRecordingSummary = mocks.getRecordingSummary;
  },
}));

vi.mock(
  'src/logic-functions/utils/list-fathom-connections-for-request.util',
  () => ({
    listFathomConnectionsForRequest: mocks.listFathomConnectionsForRequest,
  }),
);

vi.mock(
  'src/logic-functions/utils/sync-fathom-meeting-to-call-recording.util',
  () => ({
    syncFathomMeetingToCallRecording: mocks.syncFathomMeetingToCallRecording,
  }),
);

const { fathomSyncCallHandler } =
  await import('src/logic-functions/fathom-sync-call');

const CONTEXT = buildLogicFunctionExecutionContext('user-workspace-1');
const TRANSCRIPT = [
  {
    speaker: { displayName: 'Ada', matchedCalendarInviteeEmail: null },
    text: 'Hello',
    timestamp: '00:00:01',
  },
];
const SUMMARY = { templateName: 'General', markdownFormatted: '# Notes' };

describe('fathomSyncCallHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.listFathomConnectionsForRequest.mockResolvedValue([
      { id: 'connection-1', accessToken: 'token' },
    ]);
    mocks.getRecordingTranscript.mockResolvedValue({ transcript: TRANSCRIPT });
    mocks.getRecordingSummary.mockResolvedValue({ summary: SUMMARY });
    mocks.syncFathomMeetingToCallRecording.mockResolvedValue({
      callRecordingId: 'call-recording-1',
      calendarEventId: 'calendar-event-1',
      created: true,
    });
  });

  it.each([undefined, '12', 1.5])(
    'rejects a recordingId of %s before looking anything up',
    async (recordingId) => {
      expect(await fathomSyncCallHandler({ recordingId }, CONTEXT)).toEqual({
        success: false,
        error: 'recordingId must be an integer',
      });
      expect(mocks.listFathomConnectionsForRequest).not.toHaveBeenCalled();
    },
  );

  it('reports a missing connection', async () => {
    mocks.listFathomConnectionsForRequest.mockResolvedValue([]);

    expect(await fathomSyncCallHandler({ recordingId: 2 }, CONTEXT)).toEqual({
      success: false,
      error: expect.stringContaining('not connected'),
    });
  });

  it('fetches the artifacts of the requested recording and upserts it', async () => {
    mocks.listMeetings.mockImplementation(
      buildFathomMeetingPages([
        [buildFathomMeeting({ recordingId: 1 })],
        [buildFathomMeeting({ recordingId: 2 })],
        [buildFathomMeeting({ recordingId: 3 })],
      ]),
    );

    expect(await fathomSyncCallHandler({ recordingId: 2 }, CONTEXT)).toEqual({
      success: true,
      recordingId: 2,
      callRecordingId: 'call-recording-1',
      calendarEventId: 'calendar-event-1',
      created: true,
    });
    expect(mocks.listMeetings).toHaveBeenCalledTimes(2);
    expect(mocks.getRecordingTranscript).toHaveBeenCalledWith({
      recordingId: 2,
    });
    expect(mocks.syncFathomMeetingToCallRecording).toHaveBeenCalledWith({
      coreApiClient: expect.anything(),
      meeting: expect.objectContaining({
        recordingId: 2,
        recordingStartTime: new Date('2026-08-20T10:00:00.000Z'),
        transcript: TRANSCRIPT,
        defaultSummary: SUMMARY,
      }),
    });
  });

  it('tries the next connected account when the first cannot see the recording', async () => {
    mocks.listFathomConnectionsForRequest.mockResolvedValue([
      { id: 'connection-1', accessToken: 'token-1' },
      { id: 'connection-2', accessToken: 'token-2' },
    ]);
    mocks.listMeetings
      .mockImplementationOnce(buildFathomMeetingPages([[]]))
      .mockImplementationOnce(
        buildFathomMeetingPages([[buildFathomMeeting({ recordingId: 2 })]]),
      );

    expect(await fathomSyncCallHandler({ recordingId: 2 }, CONTEXT)).toEqual(
      expect.objectContaining({ success: true, recordingId: 2 }),
    );
    expect(mocks.listMeetings).toHaveBeenCalledTimes(2);
  });

  it('reports a recording no connected account can see', async () => {
    mocks.listMeetings.mockImplementation(
      buildFathomMeetingPages([[buildFathomMeeting({ recordingId: 1 })]]),
    );

    expect(await fathomSyncCallHandler({ recordingId: 2 }, CONTEXT)).toEqual({
      success: false,
      error: 'No accessible Fathom recording found for 2',
    });
    expect(mocks.syncFathomMeetingToCallRecording).not.toHaveBeenCalled();
  });
});
