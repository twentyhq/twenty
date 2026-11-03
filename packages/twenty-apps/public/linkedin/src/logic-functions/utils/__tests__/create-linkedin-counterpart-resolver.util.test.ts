import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  withLinkedinPublicIdentifier: vi.fn(),
}));

vi.mock(
  'src/logic-functions/utils/with-linkedin-public-identifier.util',
  () => ({
    withLinkedinPublicIdentifier: mocks.withLinkedinPublicIdentifier,
  }),
);

const { createLinkedinCounterpartResolver } =
  await import('src/logic-functions/utils/create-linkedin-counterpart-resolver.util');

const { UnipileRateLimitError } =
  await import('src/unipile/utils/request-unipile.util');

const DELETED_MEMBER = { id: 'ACoGONE', display_name: 'LinkedIn Member' };

describe('createLinkedinCounterpartResolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('looks up each profile once, even one LinkedIn cannot resolve', async () => {
    mocks.withLinkedinPublicIdentifier.mockResolvedValue(DELETED_MEMBER);
    const resolveCounterpart = createLinkedinCounterpartResolver('acc_1');

    await resolveCounterpart(DELETED_MEMBER);

    await expect(resolveCounterpart(DELETED_MEMBER)).resolves.toEqual(
      DELETED_MEMBER,
    );
    expect(mocks.withLinkedinPublicIdentifier).toHaveBeenCalledExactlyOnceWith({
      unipileAccountId: 'acc_1',
      user: DELETED_MEMBER,
    });
  });

  it('looks up a profile again after LinkedIn rate limited it', async () => {
    mocks.withLinkedinPublicIdentifier
      .mockRejectedValueOnce(
        new UnipileRateLimitError('Retry in 1 hour.', 3601),
      )
      .mockResolvedValueOnce(DELETED_MEMBER);
    const resolveCounterpart = createLinkedinCounterpartResolver('acc_1');

    await expect(resolveCounterpart(DELETED_MEMBER)).rejects.toThrow(
      'Retry in 1 hour.',
    );
    await expect(resolveCounterpart(DELETED_MEMBER)).resolves.toEqual(
      DELETED_MEMBER,
    );
  });
});
