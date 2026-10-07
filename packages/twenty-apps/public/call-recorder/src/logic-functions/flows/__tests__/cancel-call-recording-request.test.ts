import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { cancelCallRecordingRequest } from 'src/logic-functions/flows/cancel-call-recording-request.util';

const { cancelRecallBotMock, mutationMock } = vi.hoisted(() => ({
  mutationMock: vi.fn(),
  cancelRecallBotMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    mutation = mutationMock;
  },
}));

vi.mock('src/logic-functions/recall-api/cancel-recall-bot.util', () => ({
  cancelRecallBot: cancelRecallBotMock,
}));

describe('cancelCallRecordingRequest', () => {
  beforeEach(() => {
    mutationMock.mockReset().mockResolvedValue({
      updateCallRecording: { id: 'recording' },
      updateCallRecordings: [{ id: 'recording' }],
    });
    cancelRecallBotMock.mockReset().mockResolvedValue({ ok: true });
  });

  it.each([undefined, 'recall-bot'])(
    'persists cancellation and deletes the bot when present: %s',
    async (externalBotId) => {
      const client = new CoreApiClient();

      await expect(
        cancelCallRecordingRequest({
          client,
          callRecording: { id: 'recording', externalBotId },
        }),
      ).resolves.toBeUndefined();

      expect(mutationMock).toHaveBeenCalledWith({
        updateCallRecording: {
          __args: {
            id: 'recording',
            data: { recordingRequestStatus: 'CANCELED' },
          },
          id: true,
        },
      });
      if (externalBotId) {
        expect(cancelRecallBotMock).toHaveBeenCalledExactlyOnceWith({
          externalBotId,
        });
        expect(mutationMock).toHaveBeenCalledTimes(2);
      } else {
        expect(cancelRecallBotMock).not.toHaveBeenCalled();
      }
    },
  );

  it('preserves cancellation intent when inline cancellation throws', async () => {
    const client = new CoreApiClient();
    const cancellationError = new Error('Recall unavailable');
    cancelRecallBotMock.mockRejectedValue(cancellationError);

    await expect(
      cancelCallRecordingRequest({
        client,
        callRecording: { id: 'recording', externalBotId: 'recall-bot' },
      }),
    ).rejects.toBe(cancellationError);
    expect(mutationMock).toHaveBeenCalledOnce();
  });
});
