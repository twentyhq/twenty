import { beforeEach, describe, expect, it, vi } from 'vitest';

import removeRecallBotOnCallRecordingDeletionLogicFunction from 'src/logic-functions/remove-recall-bot-on-call-recording-deletion';
import removeRecallBotOnCallRecordingDestructionLogicFunction from 'src/logic-functions/remove-recall-bot-on-call-recording-destruction';
import { removeRecallBotOnCallRecordingRemovalHandler } from 'src/logic-functions/remove-recall-bot-on-call-recording-removal-handler';
import scheduleRecallBotOnCallRecordingRestorationLogicFunction from 'src/logic-functions/schedule-recall-bot-on-call-recording-restoration';
import { scheduleRecallBotOnCallRecordingRestorationHandler } from 'src/logic-functions/schedule-recall-bot-on-call-recording-restoration-handler';

const removeRecallBotsForRemovedCallRecordingMock = vi.hoisted(() => vi.fn());
const resumePendingCallRecordingMock = vi.hoisted(() => vi.fn());

vi.mock(
  'src/logic-functions/flows/remove-recall-bots-for-removed-call-recording.util',
  () => ({
    removeRecallBotsForRemovedCallRecording:
      removeRecallBotsForRemovedCallRecordingMock,
  }),
);
vi.mock('src/logic-functions/flows/resume-pending-call-recording.util', () => ({
  resumePendingCallRecording: resumePendingCallRecordingMock,
}));

const REMOVAL_RESULT = { removedExternalBotIds: ['recall-bot-1'] };

describe('CallRecording bot ownership triggers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    removeRecallBotsForRemovedCallRecordingMock.mockResolvedValue(
      REMOVAL_RESULT,
    );
    resumePendingCallRecordingMock.mockResolvedValue({ status: 'scheduled' });
  });

  it('subscribes separately to deletion, destruction, and restoration', () => {
    expect(
      removeRecallBotOnCallRecordingDeletionLogicFunction.config
        .databaseEventTriggerSettings,
    ).toEqual({ eventName: 'callRecording.deleted' });
    expect(
      removeRecallBotOnCallRecordingDestructionLogicFunction.config
        .databaseEventTriggerSettings,
    ).toEqual({ eventName: 'callRecording.destroyed' });
    expect(
      scheduleRecallBotOnCallRecordingRestorationLogicFunction.config
        .databaseEventTriggerSettings,
    ).toEqual({ eventName: 'callRecording.restored' });
  });

  it.each(['callRecording.deleted', 'callRecording.destroyed'])(
    'releases ownership from the %s snapshot through the shared handler',
    async (eventName) => {
      const result = await removeRecallBotOnCallRecordingRemovalHandler({
        name: eventName,
        recordId: 'call-recording-1',
        properties: {
          before: {
            status: 'SCHEDULED',
            externalBotId: 'recall-bot-1',
            botScheduleAttemptedAt: '2026-01-01T10:00:00.000Z',
            botScheduleIdempotencyKey: 'schedule-generation-1',
          },
        },
      } as never);

      expect(removeRecallBotsForRemovedCallRecordingMock).toHaveBeenCalledWith({
        client: expect.anything(),
        callRecordingId: 'call-recording-1',
        status: 'SCHEDULED',
        externalBotId: 'recall-bot-1',
        botScheduleAttemptedAt: '2026-01-01T10:00:00.000Z',
        botScheduleIdempotencyKey: 'schedule-generation-1',
      });
      expect(result).toEqual(REMOVAL_RESULT);
    },
  );

  it('resumes a restored recording after prior ownership was cleared', async () => {
    const result = await scheduleRecallBotOnCallRecordingRestorationHandler({
      name: 'callRecording.restored',
      recordId: 'call-recording-1',
      properties: {
        before: {},
        after: {
          externalBotId: null,
          botScheduleAttemptedAt: null,
        },
        updatedFields: ['deletedAt'],
        diff: {},
      },
    } as never);

    expect(resumePendingCallRecordingMock).toHaveBeenCalledWith({
      client: expect.anything(),
      callRecordingId: 'call-recording-1',
      now: expect.any(Date),
    });
    expect(removeRecallBotsForRemovedCallRecordingMock).not.toHaveBeenCalled();
    expect(result).toEqual({ status: 'scheduled' });
  });

  it('releases ambiguous ownership before resuming a restored recording', async () => {
    const result = await scheduleRecallBotOnCallRecordingRestorationHandler({
      name: 'callRecording.restored',
      recordId: 'call-recording-1',
      properties: {
        before: {},
        after: {
          status: 'SCHEDULED',
          externalBotId: null,
          botScheduleAttemptedAt: '2026-01-01T10:00:00.000Z',
          botScheduleIdempotencyKey: 'schedule-generation-1',
        },
        updatedFields: ['deletedAt'],
        diff: {},
      },
    } as never);

    expect(removeRecallBotsForRemovedCallRecordingMock).toHaveBeenCalledWith({
      client: expect.anything(),
      callRecordingId: 'call-recording-1',
      status: 'SCHEDULED',
      externalBotId: null,
      botScheduleAttemptedAt: '2026-01-01T10:00:00.000Z',
      botScheduleIdempotencyKey: 'schedule-generation-1',
    });
    expect(resumePendingCallRecordingMock).toHaveBeenCalledWith({
      client: expect.anything(),
      callRecordingId: 'call-recording-1',
      now: expect.any(Date),
    });
    expect(result).toEqual({ status: 'scheduled' });
  });
});
