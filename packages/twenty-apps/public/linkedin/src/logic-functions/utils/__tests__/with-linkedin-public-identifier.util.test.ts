import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  kvGet: vi.fn(),
  kvSet: vi.fn(),
  getUnipileUser: vi.fn(),
  consumeLinkedinProfileLookupOrThrow: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: mocks.kvGet, set: mocks.kvSet },
}));

vi.mock('src/unipile/utils/get-unipile-user.util', () => ({
  getUnipileUser: mocks.getUnipileUser,
}));

vi.mock(
  'src/logic-functions/utils/consume-linkedin-profile-lookup-or-throw.util',
  () => ({
    consumeLinkedinProfileLookupOrThrow:
      mocks.consumeLinkedinProfileLookupOrThrow,
  }),
);

const { UnipileRateLimitError, UnipileRequestError } =
  await import('src/unipile/utils/request-unipile.util');

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
    mocks.consumeLinkedinProfileLookupOrThrow.mockResolvedValue(undefined);
  });

  it('keeps a user that already carries its public identifier', async () => {
    const user = { ...DAPHNE, public_identifier: 'daphne-muller' };

    await expect(
      withLinkedinPublicIdentifier({
        unipileAccountId: 'acc_1',
        dailyLookupLimit: 60,
        user,
      }),
    ).resolves.toBe(user);
    expect(mocks.kvGet).not.toHaveBeenCalled();
    expect(mocks.getUnipileUser).not.toHaveBeenCalled();
  });

  it('leaves an uncached user as is when the caller declines the lookup', async () => {
    const shouldLookUp = vi.fn().mockResolvedValue(false);

    await expect(
      withLinkedinPublicIdentifier({
        unipileAccountId: 'acc_1',
        dailyLookupLimit: 60,
        user: DAPHNE,
        shouldLookUp,
      }),
    ).resolves.toBe(DAPHNE);
    expect(shouldLookUp).toHaveBeenCalledOnce();
    expect(mocks.getUnipileUser).not.toHaveBeenCalled();
    expect(mocks.consumeLinkedinProfileLookupOrThrow).not.toHaveBeenCalled();
  });

  it('uses the cache without asking whether to look up', async () => {
    const shouldLookUp = vi.fn().mockResolvedValue(false);

    mocks.kvGet.mockResolvedValue('daphne-muller');

    await expect(
      withLinkedinPublicIdentifier({
        unipileAccountId: 'acc_1',
        dailyLookupLimit: 60,
        user: DAPHNE,
        shouldLookUp,
      }),
    ).resolves.toEqual({ ...DAPHNE, public_identifier: 'daphne-muller' });
    expect(shouldLookUp).not.toHaveBeenCalled();
  });

  it('reads a cached public identifier without calling Unipile', async () => {
    mocks.kvGet.mockResolvedValue('daphne-muller');

    await expect(
      withLinkedinPublicIdentifier({
        unipileAccountId: 'acc_1',
        dailyLookupLimit: 60,
        user: DAPHNE,
      }),
    ).resolves.toEqual({ ...DAPHNE, public_identifier: 'daphne-muller' });
    expect(mocks.kvGet).toHaveBeenCalledExactlyOnceWith(
      'linkedin-public-identifier:ACoDAPHNE',
    );
    expect(mocks.getUnipileUser).not.toHaveBeenCalled();
    expect(mocks.consumeLinkedinProfileLookupOrThrow).not.toHaveBeenCalled();
  });

  it('fetches and caches the public identifier of an unknown user', async () => {
    mocks.getUnipileUser.mockResolvedValue({
      ...DAPHNE,
      public_identifier: 'daphne-muller',
    });

    await expect(
      withLinkedinPublicIdentifier({
        unipileAccountId: 'acc_1',
        dailyLookupLimit: 60,
        user: DAPHNE,
      }),
    ).resolves.toEqual({ ...DAPHNE, public_identifier: 'daphne-muller' });
    expect(mocks.getUnipileUser).toHaveBeenCalledExactlyOnceWith({
      accountId: 'acc_1',
      userId: 'ACoDAPHNE',
    });
    expect(mocks.kvSet).toHaveBeenCalledExactlyOnceWith(
      'linkedin-public-identifier:ACoDAPHNE',
      'daphne-muller',
    );
    expect(
      mocks.consumeLinkedinProfileLookupOrThrow,
    ).toHaveBeenCalledExactlyOnceWith({
      unipileAccountId: 'acc_1',
      dailyLimit: 60,
    });
  });

  it('does not look up a profile once the lookups of the day are used', async () => {
    mocks.consumeLinkedinProfileLookupOrThrow.mockRejectedValue(
      new UnipileRateLimitError('No lookup left today', 3600),
    );

    await expect(
      withLinkedinPublicIdentifier({
        unipileAccountId: 'acc_1',
        dailyLookupLimit: 60,
        user: DAPHNE,
      }),
    ).rejects.toThrow('No lookup left today');
    expect(mocks.getUnipileUser).not.toHaveBeenCalled();
  });

  it('fails on a temporary lookup error rather than linking a member id URL', async () => {
    mocks.getUnipileUser.mockRejectedValue(
      new UnipileRequestError('Unipile get user profile failed (429)', 429),
    );

    await expect(
      withLinkedinPublicIdentifier({
        unipileAccountId: 'acc_1',
        dailyLookupLimit: 60,
        user: DAPHNE,
      }),
    ).rejects.toThrow('(429)');
  });

  it('falls back to the user as received when the profile is gone', async () => {
    mocks.getUnipileUser.mockRejectedValue(
      new UnipileRequestError('Unipile get user profile failed (404)', 404),
    );

    await expect(
      withLinkedinPublicIdentifier({
        unipileAccountId: 'acc_1',
        dailyLookupLimit: 60,
        user: DAPHNE,
      }),
    ).resolves.toBe(DAPHNE);
    expect(mocks.kvSet).not.toHaveBeenCalled();
  });
});
