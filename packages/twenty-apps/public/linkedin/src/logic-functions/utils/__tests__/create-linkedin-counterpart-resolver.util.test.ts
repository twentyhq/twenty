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

const askBeforeReturning =
  (result: typeof DELETED_MEMBER) =>
  async ({ shouldLookUp }: { shouldLookUp?: () => Promise<boolean> }) => {
    await shouldLookUp?.();

    return result;
  };

describe('createLinkedinCounterpartResolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('looks up each profile once, even one LinkedIn cannot resolve', async () => {
    mocks.withLinkedinPublicIdentifier.mockResolvedValue(DELETED_MEMBER);
    const resolveCounterpart = createLinkedinCounterpartResolver('acc_1');

    await resolveCounterpart({ user: DELETED_MEMBER });

    await expect(resolveCounterpart({ user: DELETED_MEMBER })).resolves.toEqual(
      DELETED_MEMBER,
    );
    expect(mocks.withLinkedinPublicIdentifier).toHaveBeenCalledExactlyOnceWith({
      unipileAccountId: 'acc_1',
      user: DELETED_MEMBER,
      shouldLookUp: undefined,
    });
  });

  it('looks up a profile whose lookup was declined once it is wanted', async () => {
    const resolvedMember = { ...DELETED_MEMBER, public_identifier: 'member' };

    mocks.withLinkedinPublicIdentifier
      .mockImplementationOnce(askBeforeReturning(DELETED_MEMBER))
      .mockResolvedValueOnce(resolvedMember);
    const resolveCounterpart = createLinkedinCounterpartResolver('acc_1');

    await resolveCounterpart({
      user: DELETED_MEMBER,
      shouldLookUp: async () => false,
    });

    await expect(resolveCounterpart({ user: DELETED_MEMBER })).resolves.toEqual(
      resolvedMember,
    );
    await expect(resolveCounterpart({ user: DELETED_MEMBER })).resolves.toEqual(
      resolvedMember,
    );
    expect(mocks.withLinkedinPublicIdentifier).toHaveBeenCalledTimes(2);
  });

  it('looks up once a profile LinkedIn could not resolve after an allowed lookup', async () => {
    mocks.withLinkedinPublicIdentifier.mockImplementation(
      askBeforeReturning(DELETED_MEMBER),
    );
    const resolveCounterpart = createLinkedinCounterpartResolver('acc_1');

    await resolveCounterpart({
      user: DELETED_MEMBER,
      shouldLookUp: async () => true,
    });
    await resolveCounterpart({
      user: DELETED_MEMBER,
      shouldLookUp: async () => true,
    });

    expect(mocks.withLinkedinPublicIdentifier).toHaveBeenCalledOnce();
  });

  it('looks up a profile again after LinkedIn rate limited it', async () => {
    mocks.withLinkedinPublicIdentifier
      .mockRejectedValueOnce(
        new UnipileRateLimitError('Retry in 1 hour.', 3601),
      )
      .mockResolvedValueOnce(DELETED_MEMBER);
    const resolveCounterpart = createLinkedinCounterpartResolver('acc_1');

    await expect(resolveCounterpart({ user: DELETED_MEMBER })).rejects.toThrow(
      'Retry in 1 hour.',
    );
    await expect(resolveCounterpart({ user: DELETED_MEMBER })).resolves.toEqual(
      DELETED_MEMBER,
    );
  });
});
