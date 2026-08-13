import { beforeEach, describe, expect, it, vi } from 'vitest';

import removeRecallBotOnCallRecordingDeletionLogicFunction, {
  removeRecallBotOnCallRecordingDeletionHandler,
} from 'src/logic-functions/remove-recall-bot-on-call-recording-deletion';
import removeRecallBotOnCallRecordingDestructionLogicFunction, {
  removeRecallBotOnCallRecordingDestructionHandler,
} from 'src/logic-functions/remove-recall-bot-on-call-recording-destruction';

const removeRecallBotsForRemovedCallRecordingMock = vi.hoisted(() => vi.fn());

vi.mock(
  'src/logic-functions/flows/remove-recall-bots-for-removed-call-recording.util',
  () => ({
    removeRecallBotsForRemovedCallRecording:
      removeRecallBotsForRemovedCallRecordingMock,
  }),
);

const REMOVAL_RESULT = { removedExternalBotIds: ['recall-bot-1'] };

describe('CallRecording removal Recall cleanup triggers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    removeRecallBotsForRemovedCallRecordingMock.mockResolvedValue(
      REMOVAL_RESULT,
    );
  });

  it('subscribes separately to soft deletion and hard destruction', () => {
    expect(
      removeRecallBotOnCallRecordingDeletionLogicFunction.config
        .databaseEventTriggerSettings,
    ).toEqual({ eventName: 'callRecording.deleted' });
    expect(
      removeRecallBotOnCallRecordingDestructionLogicFunction.config
        .databaseEventTriggerSettings,
    ).toEqual({ eventName: 'callRecording.destroyed' });
  });

  it('removes the bot from the soft-deleted record snapshot', async () => {
    const result = await removeRecallBotOnCallRecordingDeletionHandler({
      name: 'callRecording.deleted',
      recordId: 'call-recording-1',
      properties: {
        before: {
          externalBotId: 'recall-bot-1',
          botScheduleAttemptedAt: '2026-01-01T10:00:00.000Z',
        },
        after: {},
        updatedFields: ['deletedAt'],
        diff: {},
      },
    } as never);

    expect(removeRecallBotsForRemovedCallRecordingMock).toHaveBeenCalledWith({
      callRecordingId: 'call-recording-1',
      externalBotId: 'recall-bot-1',
      botScheduleAttemptedAt: '2026-01-01T10:00:00.000Z',
    });
    expect(result).toEqual(REMOVAL_RESULT);
  });

  it('removes the bot from the hard-destroyed record snapshot', async () => {
    const result = await removeRecallBotOnCallRecordingDestructionHandler({
      name: 'callRecording.destroyed',
      recordId: 'call-recording-1',
      properties: {
        before: {
          externalBotId: 'recall-bot-1',
          botScheduleAttemptedAt: '2026-01-01T10:00:00.000Z',
        },
      },
    } as never);

    expect(removeRecallBotsForRemovedCallRecordingMock).toHaveBeenCalledWith({
      callRecordingId: 'call-recording-1',
      externalBotId: 'recall-bot-1',
      botScheduleAttemptedAt: '2026-01-01T10:00:00.000Z',
    });
    expect(result).toEqual(REMOVAL_RESULT);
  });
});
