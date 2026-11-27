import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getUserProfile: vi.fn() }));

vi.mock('@unipile/sdk', () => ({
  UnipileUsers: class {
    getUserProfile = mocks.getUserProfile;
  },
}));

vi.mock('src/unipile/utils/get-unipile-request-options.util', () => ({
  getUnipileRequestOptions: () => ({ auth: 'key', throwOnError: true }),
}));

const { getUnipileUserProfile } =
  await import('src/unipile/utils/get-unipile-user-profile.util');

describe('getUnipileUserProfile', () => {
  beforeEach(() => {
    mocks.getUserProfile.mockReset();
  });

  it('gives up on a profile that answers after the deadline', async () => {
    mocks.getUserProfile.mockImplementation(
      ({ signal }: { signal: AbortSignal }) =>
        new Promise((_, reject) => {
          signal.addEventListener('abort', () => reject(signal.reason));
        }),
    );

    await expect(
      getUnipileUserProfile({
        accountId: 'acc_1',
        userId: 'priya-provider-id',
        deadlineAtMs: Date.now() + 50,
      }),
    ).rejects.toThrow();
  });
});
