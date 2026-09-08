import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, expect, it, vi } from 'vitest';

import { chargeCompletedCallRecording } from 'src/logic-functions/flows/charge-completed-call-recording.util';
import { recoverRecordingCharges } from 'src/logic-functions/flows/recover-recording-charges.util';

vi.mock(
  'src/logic-functions/flows/charge-completed-call-recording.util',
  () => ({
    chargeCompletedCallRecording: vi.fn(),
  }),
);

const query = vi.fn();
const mutation = vi.fn();
const client = { query, mutation } as unknown as CoreApiClient;
const now = new Date('2026-09-08T10:00:00Z');
const node = (id: string, status = 'PENDING') => ({
  node: { id, companionBillingState: { status } },
});

beforeEach(() => {
  vi.resetAllMocks();
  mutation.mockResolvedValue({ updateCallRecordings: [{ id: 'claimed' }] });
  vi.mocked(chargeCompletedCallRecording).mockResolvedValue(undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

it('retries stale completed charges and ignores acknowledged or unrelated JSON matches', async () => {
  query.mockResolvedValue({
    callRecordings: {
      edges: [
        node('pending'),
        node('accepted', 'ACCEPTED'),
        node('unrelated', 'NOT_PENDING'),
      ],
    },
  });
  await recoverRecordingCharges(client, now);
  expect(query.mock.calls[0][0].callRecordings.__args).toMatchObject({
    first: 5,
    orderBy: [{ updatedAt: 'AscNullsFirst' }],
    filter: {
      status: { eq: 'COMPLETED' },
      updatedAt: { lt: '2026-09-08T09:55:00.000Z' },
    },
  });
  expect(chargeCompletedCallRecording).toHaveBeenCalledExactlyOnceWith(client, {
    callRecordingId: 'pending',
  });
});

it('continues the batch after either a claim or a charge fails', async () => {
  query.mockResolvedValue({
    callRecordings: {
      edges: [node('claim-failure'), node('charge-failure'), node('healthy')],
    },
  });
  mutation.mockRejectedValueOnce(new Error('claim unavailable'));
  vi.mocked(chargeCompletedCallRecording).mockRejectedValueOnce(
    new Error('billing unavailable'),
  );
  await recoverRecordingCharges(client, now);
  expect(
    vi
      .mocked(chargeCompletedCallRecording)
      .mock.calls.map(([, input]) => input.callRecordingId),
  ).toEqual(['charge-failure', 'healthy']);
  expect(mutation).toHaveBeenCalledTimes(3);
});

it('does not deliver a charge claimed by another recovery run', async () => {
  query.mockResolvedValue({ callRecordings: { edges: [node('racing')] } });
  mutation.mockResolvedValue({ updateCallRecordings: [] });
  await recoverRecordingCharges(client, now);
  expect(chargeCompletedCallRecording).not.toHaveBeenCalled();
});
