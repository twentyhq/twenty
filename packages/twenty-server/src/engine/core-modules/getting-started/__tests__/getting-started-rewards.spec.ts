import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';

const buildService = () => {
  const grants = new Set<string>();
  const grantCredits = jest.fn(async ({ idempotencyKey }) => {
    grants.add(idempotencyKey);
  });
  const creditGrants = {
    findGrantByIdempotencyKey: jest.fn(async (_workspaceId, key) =>
      grants.has(key),
    ),
    countGrantsByIdempotencyKeyPrefix: jest.fn(async () => grants.size),
  };
  const config = {
    get: jest.fn(
      (key: string) =>
        ({
          ONBOARDING_INVITE_TEAM_MAX_INVITES: 5,
          ONBOARDING_INVITE_TEAM_CREDITS_REWARD_PER_USER: 500_000,
          ONBOARDING_IMPORT_CONTACTS_CREDITS_REWARD: 1_000_000,
        })[key],
    ),
  };
  const completeStep = jest.fn();
  const service = new OnboardingService(
    { completeStep } as never,
    {} as never,
    { grantCredits } as never,
    creditGrants as never,
    { withLock: async (run: () => Promise<void>) => run() } as never,
    { captureExceptions: jest.fn() } as never,
    { delete: jest.fn().mockResolvedValue(0) } as never,
    config as never,
    {} as never,
    { findOne: jest.fn().mockResolvedValue({ userId: 'creator' }) } as never,
    {
      transaction: async (run: (manager: unknown) => Promise<void>) =>
        run({ queryRunner: { query: jest.fn() } }),
    } as never,
  );
  return { service, grants, grantCredits, completeStep };
};

describe('Getting started rewards', () => {
  it('uses the same ledger key for invitation send, retry and acceptance', async () => {
    const { service, grants, grantCredits } = buildService();
    for (const input of [
      { userId: 'token-1', recipientEmail: 'Alex@example.com' },
      { userId: 'token-2', recipientEmail: ' alex@example.com ' },
      { userId: 'accepted-user', recipientEmail: 'alex@example.com' },
    ])
      await service.creditInviteTeamReward({
        workspaceId: 'workspace',
        ...input,
      });
    expect(grants.size).toBe(1);
    expect(grantCredits).toHaveBeenLastCalledWith(
      expect.objectContaining({ amountMicro: 500_000 }),
    );
  });
  it('honors rewards already granted under legacy user keys', async () => {
    const { service, grants, grantCredits } = buildService();
    grants.add('onboarding-invite-team:workspace:legacy-user');
    await service.creditInviteTeamReward({
      workspaceId: 'workspace',
      userId: 'legacy-user',
      recipientEmail: 'alex@example.com',
    });
    expect(grantCredits).not.toHaveBeenCalled();
  });
  it('caps the invitation reward at the configured limit', async () => {
    const { service, grants, grantCredits } = buildService();
    for (let index = 0; index < 6; index++)
      await service.creditInviteTeamReward({
        workspaceId: 'workspace',
        userId: `token-${index}`,
        recipientEmail: `user${index}@example.com`,
      });
    expect(grants.size).toBe(5);
    expect(grantCredits).toHaveBeenCalledTimes(5);
  });
  it('credits a mailbox connection after the creator skipped the original onboarding step', async () => {
    const { service, grants, completeStep } = buildService();
    await service.completeOnboardingConnectAccountStep({
      workspaceId: 'workspace',
      userId: 'creator',
    });
    await service.completeOnboardingConnectAccountStep({
      workspaceId: 'workspace',
      userId: 'creator',
    });
    expect(grants).toEqual(new Set(['onboarding-import-contacts:workspace']));
    expect(completeStep).toHaveBeenCalledWith(
      { workspaceId: 'workspace', userId: 'creator' },
      'connectMailbox',
    );
  });
});
