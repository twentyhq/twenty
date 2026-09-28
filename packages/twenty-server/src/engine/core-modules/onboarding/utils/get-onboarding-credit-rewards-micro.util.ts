import { isDefined } from 'twenty-shared/utils';

import { type BillingCreditGrantEntity } from 'src/engine/core-modules/billing/entities/billing-credit-grant.entity';
import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { ONBOARDING_REWARD_IDEMPOTENCY_KEY_PREFIXES } from 'src/engine/core-modules/onboarding/constants/onboarding-reward-idempotency-key-prefixes';

type OnboardingRewardKind =
  keyof typeof ONBOARDING_REWARD_IDEMPOTENCY_KEY_PREFIXES;

type OnboardingRewardGrant = Pick<
  BillingCreditGrantEntity,
  'type' | 'amountMicro' | 'idempotencyKey' | 'revokedAt'
>;

export type OnboardingCreditRewardsMicro = {
  amountMicroByKind: Record<OnboardingRewardKind, number>;
  totalAmountMicro: number;
  joinedTeammatesCount: number;
};

const ONBOARDING_REWARD_KINDS = Object.keys(
  ONBOARDING_REWARD_IDEMPOTENCY_KEY_PREFIXES,
) as OnboardingRewardKind[];

const findOnboardingRewardKind = (
  idempotencyKey: string | null,
): OnboardingRewardKind | undefined =>
  ONBOARDING_REWARD_KINDS.find(
    (kind) =>
      idempotencyKey?.startsWith(
        `${ONBOARDING_REWARD_IDEMPOTENCY_KEY_PREFIXES[kind]}:`,
      ) === true,
  );

export const getOnboardingCreditRewardsMicro = (
  grants: OnboardingRewardGrant[],
): OnboardingCreditRewardsMicro => {
  const amountMicroByKind: Record<OnboardingRewardKind, number> = {
    importContacts: 0,
    installApps: 0,
    inviteTeam: 0,
    enrichmentQualification: 0,
  };
  let totalAmountMicro = 0;
  let joinedTeammatesCount = 0;

  for (const grant of grants) {
    if (
      grant.type !== BillingCreditGrantType.ONBOARDING_REWARD ||
      isDefined(grant.revokedAt)
    ) {
      continue;
    }

    totalAmountMicro += grant.amountMicro;

    const kind = findOnboardingRewardKind(grant.idempotencyKey);

    if (!isDefined(kind)) {
      continue;
    }

    amountMicroByKind[kind] += grant.amountMicro;

    if (kind === 'inviteTeam') {
      joinedTeammatesCount += 1;
    }
  }

  return { amountMicroByKind, totalAmountMicro, joinedTeammatesCount };
};
