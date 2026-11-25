import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ solveCheckpoint: vi.fn() }));

vi.mock('@unipile/sdk', () => ({
  UnipileCustomAuth: class {
    solveCheckpoint = mocks.solveCheckpoint;
  },
}));

vi.mock('src/unipile/utils/get-unipile-request-options.util', () => ({
  getUnipileRequestOptions: () => ({ auth: 'key', throwOnError: true }),
}));

const { waitForUnipileCheckpoint } =
  await import('src/unipile/utils/wait-for-unipile-checkpoint.util');

describe('waitForUnipileCheckpoint', () => {
  it('returns what Unipile answers once the member acted', async () => {
    const account = { object: 'Account', id: 'acc_1' };

    mocks.solveCheckpoint.mockResolvedValue({ data: account });

    await expect(
      waitForUnipileCheckpoint({
        intentId: 'intent_1',
        timeoutMilliseconds: 1000,
      }),
    ).resolves.toEqual(account);
    expect(mocks.solveCheckpoint).toHaveBeenCalledWith(
      expect.objectContaining({ body: { intent_id: 'intent_1', code: '' } }),
    );
  });

  it('returns nothing when the member has not acted within the wait', async () => {
    mocks.solveCheckpoint.mockImplementation(
      ({ signal }: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(signal.reason));
        }),
    );

    await expect(
      waitForUnipileCheckpoint({
        intentId: 'intent_1',
        timeoutMilliseconds: 5,
      }),
    ).resolves.toBeNull();
  });

  it('fails with the reason Unipile gives when the intent is gone', async () => {
    mocks.solveCheckpoint.mockRejectedValue({
      status: 400,
      title: 'Unknown intent',
    });

    await expect(
      waitForUnipileCheckpoint({
        intentId: 'intent_1',
        timeoutMilliseconds: 1000,
      }),
    ).rejects.toMatchObject({ name: 'UnipileRequestError', status: 400 });
  });
});
