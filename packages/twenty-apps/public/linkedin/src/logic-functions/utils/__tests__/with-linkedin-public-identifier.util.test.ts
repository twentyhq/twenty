import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  kvGet: vi.fn(),
  kvSet: vi.fn(),
  getUnipileUser: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: mocks.kvGet, set: mocks.kvSet },
}));

vi.mock('src/unipile/utils/get-unipile-user.util', () => ({
  getUnipileUser: mocks.getUnipileUser,
}));

const { withLinkedinPublicIdentifier } =
  await import('src/logic-functions/utils/with-linkedin-public-identifier.util');

const DAPHNE = {
  id: 'ACoDAPHNE',
  display_name: 'Daphné Müller',
  profile_url: 'https://www.linkedin.com/in/ACoDAPHNE',
};

describe('withLinkedinPublicIdentifier', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mocks.kvGet.mockResolvedValue(null);
  });

  it('keeps a user that already carries its public identifier', async () => {
    const user = { ...DAPHNE, public_identifier: 'daphne-muller' };

    await expect(
      withLinkedinPublicIdentifier({ unipileAccountId: 'acc_1', user }),
    ).resolves.toBe(user);
    expect(mocks.kvGet).not.toHaveBeenCalled();
    expect(mocks.getUnipileUser).not.toHaveBeenCalled();
  });

  it('reads a cached public identifier without calling Unipile', async () => {
    mocks.kvGet.mockResolvedValue('daphne-muller');

    await expect(
      withLinkedinPublicIdentifier({ unipileAccountId: 'acc_1', user: DAPHNE }),
    ).resolves.toEqual({ ...DAPHNE, public_identifier: 'daphne-muller' });
    expect(mocks.kvGet).toHaveBeenCalledWith(
      'linkedin-public-identifier:ACoDAPHNE',
    );
    expect(mocks.getUnipileUser).not.toHaveBeenCalled();
  });

  it('fetches and caches the public identifier of an unknown user', async () => {
    mocks.getUnipileUser.mockResolvedValue({
      ...DAPHNE,
      public_identifier: 'daphne-muller',
    });

    await expect(
      withLinkedinPublicIdentifier({ unipileAccountId: 'acc_1', user: DAPHNE }),
    ).resolves.toEqual({ ...DAPHNE, public_identifier: 'daphne-muller' });
    expect(mocks.getUnipileUser).toHaveBeenCalledWith({
      accountId: 'acc_1',
      userId: 'ACoDAPHNE',
    });
    expect(mocks.kvSet).toHaveBeenCalledWith(
      'linkedin-public-identifier:ACoDAPHNE',
      'daphne-muller',
    );
  });

  it('falls back to the user as received when the profile lookup fails', async () => {
    mocks.getUnipileUser.mockRejectedValue(new Error('429 too many requests'));

    await expect(
      withLinkedinPublicIdentifier({ unipileAccountId: 'acc_1', user: DAPHNE }),
    ).resolves.toBe(DAPHNE);
    expect(mocks.kvSet).not.toHaveBeenCalled();
  });
});
