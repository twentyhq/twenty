import { beforeEach, describe, expect, it, vi } from 'vitest';

import { reconcileCallRecordingMeeting } from 'src/logic-functions/flows/reconcile-call-recording-meeting.util';

const reconcileMock = vi.hoisted(() => vi.fn());
const findCallRecordingsByIdsMock = vi.hoisted(() => vi.fn());

vi.mock('src/logic-functions/flows/reconcile-call-recorder.util', () => ({
  reconcileCallRecorderForCalendarEventIds: reconcileMock,
}));

vi.mock('src/logic-functions/data/find-call-recordings-by-ids.util', () => ({
  findCallRecordingsByIds: findCallRecordingsByIdsMock,
}));

const CLIENT = { query: vi.fn(), mutation: vi.fn() };

describe('reconcileCallRecordingMeeting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reconciles the meeting the call recording belongs to', async () => {
    findCallRecordingsByIdsMock.mockResolvedValue([
      { id: 'call-recording-1', calendarEventId: 'calendar-event-1' },
    ]);

    await reconcileCallRecordingMeeting({
      client: CLIENT,
      callRecordingId: 'call-recording-1',
    });

    expect(reconcileMock).toHaveBeenCalledWith(
      expect.objectContaining({ calendarEventIds: ['calendar-event-1'] }),
    );
  });

  it.each([
    ['is gone', []],
    [
      'has no meeting',
      [{ id: 'call-recording-1', calendarEventId: undefined }],
    ],
  ])(
    'does nothing when the call recording %s',
    async (_label, callRecordings) => {
      findCallRecordingsByIdsMock.mockResolvedValue(callRecordings);

      await reconcileCallRecordingMeeting({
        client: CLIENT,
        callRecordingId: 'call-recording-1',
      });

      expect(reconcileMock).not.toHaveBeenCalled();
    },
  );
});
