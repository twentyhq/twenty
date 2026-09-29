import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { onboardingInviteTeamValidEmailsSelector } from '@/onboarding/states/selectors/onboardingInviteTeamValidEmailsSelector';
import { getInviteTeamCreditsReward } from '@/onboarding/utils/getInviteTeamCreditsReward';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const onboardingInviteTeamCreditsRewardSelector =
  createAtomSelector<number>({
    key: 'onboardingInviteTeamCreditsRewardSelector',
    get: ({ get }) => {
      const onboardingInviteTeamValidEmails = get(
        onboardingInviteTeamValidEmailsSelector,
      );
      const onboardingConfig = get(onboardingConfigState);

      return isNonEmptyArray(onboardingInviteTeamValidEmails)
        ? getInviteTeamCreditsReward({
            invitedTeammatesCount: onboardingInviteTeamValidEmails.length,
            onboardingConfig,
          })
        : (onboardingConfig?.inviteTeamCreditsRewardPerUser ?? 0);
    },
  });
