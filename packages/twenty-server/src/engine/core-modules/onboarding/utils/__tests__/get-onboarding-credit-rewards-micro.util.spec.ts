import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { getOnboardingCreditRewardsMicro } from 'src/engine/core-modules/onboarding/utils/get-onboarding-credit-rewards-micro.util';

const buildGrant = ({
  amountMicro,
  idempotencyKey,
  type = BillingCreditGrantType.ONBOARDING_REWARD,
  revokedAt = null,
}: {
  amountMicro: number;
  idempotencyKey: string | null;
  type?: BillingCreditGrantType;
  revokedAt?: Date | null;
}) => ({ amountMicro, idempotencyKey, type, revokedAt });

describe('getOnboardingCreditRewardsMicro', () => {
  it('should return zero rewards when there are no grants', () => {
    expect(getOnboardingCreditRewardsMicro([])).toEqual({
      amountMicroByKind: {
        importContacts: 0,
        installApps: 0,
        inviteTeam: 0,
        enrichmentQualification: 0,
      },
      totalAmountMicro: 0,
      joinedTeammatesCount: 0,
    });
  });

  it('should sum each onboarding reward by kind', () => {
    const rewards = getOnboardingCreditRewardsMicro([
      buildGrant({
        amountMicro: 1_000_000,
        idempotencyKey: 'onboarding-import-contacts:workspace-id',
      }),
      buildGrant({
        amountMicro: 1_500_000,
        idempotencyKey: 'onboarding-install-apps:workspace-id',
      }),
      buildGrant({
        amountMicro: 500_000,
        idempotencyKey: 'onboarding-invite-team:workspace-id:user-1',
      }),
      buildGrant({
        amountMicro: 500_000,
        idempotencyKey: 'onboarding-invite-team:workspace-id:user-2',
      }),
      buildGrant({
        amountMicro: 5_000_000,
        idempotencyKey: 'onboarding-enrichment-qualified:workspace-id',
      }),
    ]);

    expect(rewards).toEqual({
      amountMicroByKind: {
        importContacts: 1_000_000,
        installApps: 1_500_000,
        inviteTeam: 1_000_000,
        enrichmentQualification: 5_000_000,
      },
      totalAmountMicro: 8_500_000,
      joinedTeammatesCount: 2,
    });
  });

  it('should ignore revoked grants and grants that are not onboarding rewards', () => {
    const rewards = getOnboardingCreditRewardsMicro([
      buildGrant({
        amountMicro: 1_000_000,
        idempotencyKey: 'onboarding-import-contacts:workspace-id',
        revokedAt: new Date(),
      }),
      buildGrant({
        amountMicro: 9_000_000,
        idempotencyKey: null,
        type: BillingCreditGrantType.COMPENSATION,
      }),
    ]);

    expect(rewards.totalAmountMicro).toBe(0);
    expect(rewards.amountMicroByKind.importContacts).toBe(0);
  });

  it('should count an onboarding reward of unknown kind in the total only', () => {
    const rewards = getOnboardingCreditRewardsMicro([
      buildGrant({ amountMicro: 2_000_000, idempotencyKey: null }),
    ]);

    expect(rewards.totalAmountMicro).toBe(2_000_000);
    expect(Object.values(rewards.amountMicroByKind)).toEqual([0, 0, 0, 0]);
  });
});
