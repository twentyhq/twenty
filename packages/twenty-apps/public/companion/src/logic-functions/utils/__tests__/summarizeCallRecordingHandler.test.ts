import { beforeEach, expect, it, vi } from 'vitest';

import { summarizeCallRecordingHandler } from 'src/logic-functions/utils/summarizeCallRecordingHandler';

const enqueueJobsMock = vi.hoisted(() => vi.fn());
const generateMock = vi.hoisted(() => vi.fn());
vi.mock('twenty-sdk/logic-function', () => ({ enqueueJobs: enqueueJobsMock }));
vi.mock('twenty-client-sdk/core', () => ({ CoreApiClient: class {} }));
vi.mock('src/logic-functions/flows/utils/generateCallRecordingSummary', () => ({
  generateCallRecordingSummary: generateMock,
}));

beforeEach(() => {
  vi.clearAllMocks();
  enqueueJobsMock.mockResolvedValue({ enqueued: true });
  generateMock.mockResolvedValue({ outcome: 'generated' });
});

const event = {
  name: 'callRecording.updated',
  recordId: 'recording-1',
  properties: { updatedFields: ['transcript'] },
} as Parameters<typeof summarizeCallRecordingHandler>[0];

it('queues duplicate transcript events with the same job ID instead of generating inline', async () => {
  await Promise.all([
    summarizeCallRecordingHandler(event),
    summarizeCallRecordingHandler(event),
  ]);
  expect(enqueueJobsMock).toHaveBeenCalledTimes(2);
  expect(enqueueJobsMock.mock.calls[0][0]).toEqual(
    enqueueJobsMock.mock.calls[1][0],
  );
  expect(enqueueJobsMock.mock.calls[0][0].jobs).toEqual([
    {
      jobId: 'companion-summary-recording-1',
      payload: { callRecordingId: 'recording-1' },
    },
  ]);
  expect(generateMock).not.toHaveBeenCalled();
});

it('generates in the worker without enqueueing itself again', async () => {
  await expect(
    summarizeCallRecordingHandler({ callRecordingId: 'recording-1' }),
  ).resolves.toEqual({ callRecordingId: 'recording-1', outcome: 'generated' });
  expect(enqueueJobsMock).not.toHaveBeenCalled();
  expect(generateMock).toHaveBeenCalledOnce();
});

it('propagates enqueue failures so event delivery can retry', async () => {
  enqueueJobsMock.mockRejectedValueOnce(new Error('Queue unavailable'));
  await expect(summarizeCallRecordingHandler(event)).rejects.toThrow(
    'Queue unavailable',
  );
  expect(generateMock).not.toHaveBeenCalled();
});
