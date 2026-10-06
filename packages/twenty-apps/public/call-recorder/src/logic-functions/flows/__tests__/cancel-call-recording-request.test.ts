import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { cancelCallRecordingRequest } from 'src/logic-functions/flows/cancel-call-recording-request.util';

const { enqueueJobsMock, cancelRecallBotMock } = vi.hoisted(() => ({
  enqueueJobsMock: vi.fn(),
  cancelRecallBotMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({ enqueueJobs: enqueueJobsMock }));
vi.mock('src/logic-functions/recall-api/cancel-recall-bot.util', () => ({
  cancelRecallBot: cancelRecallBotMock,
}));

describe('cancelCallRecordingRequest', () => {
  beforeEach(() => {
    enqueueJobsMock.mockReset().mockResolvedValue({ enqueued: true });
    cancelRecallBotMock.mockReset().mockResolvedValue({ ok: true });
  });

  it.each([undefined, 'recall-bot'])(
    'persists cancellation despite an enqueue failure with bot %s',
    async (externalBotId) => {
      const fetchMock = vi.fn().mockImplementation(
        async () =>
          new Response(
            JSON.stringify({
              data: {
                updateCallRecording: { id: 'recording' },
                updateCallRecordings: [{ id: 'recording' }],
              },
            }),
          ),
      );
      const client = new CoreApiClient({
        url: 'https://example.test/graphql',
        fetch: fetchMock,
      });
      const enqueueError = new Error('queue unavailable');
      enqueueJobsMock.mockRejectedValue(enqueueError);

      await expect(
        cancelCallRecordingRequest({
          client,
          callRecording: { id: 'recording', externalBotId },
        }),
      ).rejects.toBe(enqueueError);

      expect(fetchMock).toHaveBeenCalledWith(
        'https://example.test/graphql',
        expect.objectContaining({
          body: expect.stringContaining('CANCELED'),
        }),
      );
      if (externalBotId) {
        expect(cancelRecallBotMock).toHaveBeenCalledExactlyOnceWith({
          externalBotId,
        });
        expect(fetchMock).toHaveBeenCalledTimes(2);
      } else {
        expect(cancelRecallBotMock).not.toHaveBeenCalled();
      }
    },
  );

  it('still arms recovery when inline cancellation throws', async () => {
    const client = new CoreApiClient({
      url: 'https://example.test/graphql',
      fetch: async () =>
        new Response(
          JSON.stringify({
            data: { updateCallRecording: { id: 'recording' } },
          }),
        ),
    });
    const cancellationError = new Error('Recall unavailable');
    cancelRecallBotMock.mockRejectedValue(cancellationError);

    await expect(
      cancelCallRecordingRequest({
        client,
        callRecording: { id: 'recording', externalBotId: 'recall-bot' },
      }),
    ).rejects.toBe(cancellationError);
    expect(enqueueJobsMock).toHaveBeenCalledTimes(1);
  });
});
