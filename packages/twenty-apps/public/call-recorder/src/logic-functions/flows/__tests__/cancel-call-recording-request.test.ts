import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { cancelCallRecordingRequest } from 'src/logic-functions/flows/cancel-call-recording-request.util';

const cancelRecallBotMock = vi.hoisted(() => vi.fn());
const clearCallRecordingBotOwnershipMock = vi.hoisted(() => vi.fn());
const findCallRecordingsByIdsMock = vi.hoisted(() => vi.fn());
const updateCallRecordingMock = vi.hoisted(() => vi.fn());

vi.mock('src/logic-functions/recall-api/cancel-recall-bot.util', () => ({
  cancelRecallBot: cancelRecallBotMock,
}));
vi.mock(
  'src/logic-functions/data/clear-call-recording-bot-ownership.util',
  () => ({
    clearCallRecordingBotOwnership: clearCallRecordingBotOwnershipMock,
  }),
);
vi.mock('src/logic-functions/data/find-call-recordings-by-ids.util', () => ({
  findCallRecordingsByIds: findCallRecordingsByIdsMock,
}));
vi.mock('src/logic-functions/data/update-call-recording.util', () => ({
  updateCallRecording: updateCallRecordingMock,
}));

describe('cancelCallRecordingRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cancelRecallBotMock.mockResolvedValue({ ok: true });
    findCallRecordingsByIdsMock.mockResolvedValue([
      {
        id: 'call-recording-1',
        externalBotId: 'recall-bot-1',
        botScheduleIdempotencyKey: 'schedule-generation-1',
      },
    ]);
  });

  it('clears ownership using the current persisted schedule generation', async () => {
    const client = {} as CoreApiClient;

    await cancelCallRecordingRequest({
      client,
      callRecording: {
        id: 'call-recording-1',
        externalBotId: 'recall-bot-1',
      },
    });

    expect(findCallRecordingsByIdsMock).toHaveBeenCalledWith(client, [
      'call-recording-1',
    ]);
    expect(clearCallRecordingBotOwnershipMock).toHaveBeenCalledWith(client, {
      callRecordingId: 'call-recording-1',
      expectedExternalBotId: 'recall-bot-1',
      expectedBotScheduleIdempotencyKey: 'schedule-generation-1',
    });
  });
});
