import { beforeEach, describe, expect, it, vi } from 'vitest';

import { syncCallRecordingCalendarParticipant } from 'src/logic-functions/utils/sync-call-recording-calendar-participant.util';

const applicationId = 'app-id';
const callRecordingId = 'recording-id';
const client = { query: vi.fn(), mutation: vi.fn() };
const recording = {
  calendarEventId: 'event-id',
  externalBotId: 'scheduled-bot',
  status: 'SCHEDULED',
};
const sync = () =>
  syncCallRecordingCalendarParticipant({
    client,
    applicationId,
    callRecordingId,
  });
const setRecording = (node: object | undefined) =>
  client.query.mockResolvedValue({
    callRecordings: { edges: node ? [{ node }] : [] },
  });

describe('call recorder calendar participant', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setRecording(recording);
  });

  it('upserts one real participant for a scheduled bot and restricts reads to this app', async () => {
    await sync();
    await sync();

    expect(client.query).toHaveBeenCalledWith(
      expect.objectContaining({
        callRecordings: expect.objectContaining({
          __args: {
            filter: {
              id: { eq: callRecordingId },
              applicationId: { eq: applicationId },
            },
            first: 1,
          },
        }),
      }),
    );
    expect(client.mutation).toHaveBeenCalledTimes(2);
    expect(client.mutation).toHaveBeenLastCalledWith({
      createCalendarEventParticipants: {
        __args: {
          data: [
            {
              id: callRecordingId,
              calendarEventId: 'event-id',
              applicationId,
              handle: 'Call Recorder',
              displayName: 'Call Recorder',
              isOrganizer: false,
              responseStatus: 'ACCEPTED',
            },
          ],
          upsert: true,
        },
        id: true,
      },
    });
  });

  it.each([
    undefined,
    { ...recording, externalBotId: null },
    { ...recording, externalBotId: '  ' },
    { ...recording, calendarEventId: null },
    { ...recording, status: 'NOT_RECORDED' },
  ])(
    'removes only this app participant when the source no longer has a scheduled bot: %j',
    async (node) => {
      setRecording(node);
      await sync();
      expect(client.mutation).toHaveBeenCalledWith({
        destroyCalendarEventParticipants: {
          __args: {
            filter: {
              id: { eq: callRecordingId },
              applicationId: { eq: applicationId },
            },
          },
          id: true,
        },
      });
    },
  );

  it('moves the same participant when the recording is relinked', async () => {
    setRecording({ ...recording, calendarEventId: 'other-event' });
    await sync();
    expect(client.mutation).toHaveBeenCalledWith(
      expect.objectContaining({
        createCalendarEventParticipants: expect.objectContaining({
          __args: expect.objectContaining({
            data: [
              expect.objectContaining({
                id: callRecordingId,
                calendarEventId: 'other-event',
              }),
            ],
          }),
        }),
      }),
    );
  });

  it('keeps the participant for completed recordings', async () => {
    setRecording({ ...recording, status: 'COMPLETED' });
    await sync();
    expect(client.mutation).toHaveBeenCalledWith(
      expect.objectContaining({
        createCalendarEventParticipants: expect.any(Object),
      }),
    );
  });

  it('does not write after a failed source read', async () => {
    client.query.mockRejectedValue(new Error('API unavailable'));
    await expect(sync()).rejects.toThrow('API unavailable');
    expect(client.mutation).not.toHaveBeenCalled();
  });
  it('recovers when another delivery creates the same participant first', async () => {
    client.mutation
      .mockRejectedValueOnce(new Error('Duplicate entry'))
      .mockResolvedValueOnce({
        updateCalendarEventParticipants: [{ id: callRecordingId }],
      });
    await sync();
    expect(client.mutation).toHaveBeenLastCalledWith({
      updateCalendarEventParticipants: {
        __args: {
          filter: {
            id: { eq: callRecordingId },
            applicationId: { eq: applicationId },
          },
          data: {
            calendarEventId: 'event-id',
            handle: 'Call Recorder',
            displayName: 'Call Recorder',
            isOrganizer: false,
            responseStatus: 'ACCEPTED',
          },
        },
        id: true,
      },
    });
  });

  it('keeps the original failure when no owned participant can be updated', async () => {
    client.mutation
      .mockRejectedValueOnce(new Error('Cannot create participant'))
      .mockResolvedValueOnce({ updateCalendarEventParticipants: [] });
    await expect(sync()).rejects.toThrow('Cannot create participant');
  });
  it('removes a participant if the recording is removed while creation is in flight', async () => {
    setRecording(undefined);
    client.query.mockResolvedValueOnce({
      callRecordings: { edges: [{ node: recording }] },
    });
    await sync();
    expect(client.mutation).toHaveBeenLastCalledWith(
      expect.objectContaining({
        destroyCalendarEventParticipants: expect.any(Object),
      }),
    );
  });

  it('recreates a participant if the recording is restored while removal is in flight', async () => {
    client.query.mockResolvedValueOnce({ callRecordings: { edges: [] } });
    await sync();
    expect(client.mutation).toHaveBeenLastCalledWith(
      expect.objectContaining({
        createCalendarEventParticipants: expect.any(Object),
      }),
    );
  });
});
