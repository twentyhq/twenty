import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, expect, it, vi } from 'vitest';
import { kv } from 'twenty-sdk/logic-function';

import { recoverRecordingSummaries } from 'src/logic-functions/flows/recover-recording-summaries.util';

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: vi.fn(), set: vi.fn() },
}));
const query = vi.fn();
const mutation = vi.fn();
const client = { query, mutation } as unknown as CoreApiClient;
const now = new Date('2026-09-08T10:00:00Z');

beforeEach(() => {
  vi.resetAllMocks();
  query.mockResolvedValue({
    callRecordings: { edges: [{ node: { id: 'recording' } }] },
  });
  mutation.mockResolvedValue({ updateCallRecordings: [{ id: 'recording' }] });
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

it('saves an already-paid result without starting another generation or overwriting an existing summary', async () => {
  vi.mocked(kv.get).mockResolvedValue({
    status: 'READY',
    markdown: 'Saved result',
  });
  await recoverRecordingSummaries(client, now);
  expect(mutation.mock.calls[0][0].updateCallRecordings.__args).toMatchObject({
    filter: {
      id: { eq: 'recording' },
      or: [
        { summary: { markdown: { is: 'NULL' } } },
        { summary: { markdown: { eq: '' } } },
      ],
    },
    data: { summary: { markdown: 'Saved result', blocknote: null } },
  });
});

it.each([null, { status: 'RUNNING' }, { status: 'EMPTY' }])(
  'does not generate for a missing or incomplete paid result: %j',
  async (value) => {
    vi.mocked(kv.get).mockResolvedValue(value);
    await recoverRecordingSummaries(client, now);
    expect(mutation).not.toHaveBeenCalled();
  },
);

it('continues after one recording cannot be saved', async () => {
  query.mockResolvedValue({
    callRecordings: {
      edges: [{ node: { id: 'first' } }, { node: { id: 'second' } }],
    },
  });
  vi.mocked(kv.get).mockResolvedValue({
    status: 'READY',
    markdown: 'Saved result',
  });
  mutation.mockRejectedValueOnce(new Error('temporary write failure'));
  await recoverRecordingSummaries(client, now);
  expect(
    mutation.mock.calls[1][0].updateCallRecordings.__args.filter.id.eq,
  ).toBe('second');
});

it('advances past legacy rows without modifying the timestamp used by billing recovery', async () => {
  vi.mocked(kv.get)
    .mockResolvedValueOnce('previous-page')
    .mockResolvedValue(null);
  query.mockResolvedValue({
    callRecordings: {
      edges: [{ node: { id: 'legacy' } }],
      pageInfo: { hasNextPage: true, endCursor: 'next-page' },
    },
  });
  await recoverRecordingSummaries(client, now);
  expect(query.mock.calls[0][0].callRecordings.__args).toMatchObject({
    after: 'previous-page',
    orderBy: [{ createdAt: 'AscNullsFirst' }],
  });
  expect(
    query.mock.calls[0][0].callRecordings.__args.filter,
  ).not.toHaveProperty('updatedAt');
  expect(mutation).not.toHaveBeenCalled();
  expect(kv.set).toHaveBeenCalledWith(
    'companion-summary-recovery-cursor',
    'next-page',
  );
});

it('returns to the first page after reaching the end, allowing failed saves to retry', async () => {
  vi.mocked(kv.get)
    .mockResolvedValueOnce('last-page')
    .mockResolvedValue({ status: 'READY', markdown: 'Saved result' });
  mutation.mockRejectedValueOnce(new Error('Write unavailable'));
  query.mockResolvedValue({
    callRecordings: {
      edges: [{ node: { id: 'recording' } }],
      pageInfo: { hasNextPage: false, endCursor: 'last-recording' },
    },
  });
  await recoverRecordingSummaries(client, now);
  expect(kv.set).toHaveBeenCalledWith(
    'companion-summary-recovery-cursor',
    null,
  );
});
