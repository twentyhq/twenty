import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { type OnboardingCreditsStep } from '@/onboarding/types/OnboardingCreditsStep';
import { getIsPlanRequired } from '@/onboarding/utils/getIsPlanRequired';
import { getOnboardingRewardCreditsByStep } from '@/onboarding/utils/getOnboardingRewardCreditsByStep';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isDefined } from 'twenty-shared/utils';

export const onboardingRewardCreditsByStepSelector = createAtomSelector<
  Record<OnboardingCreditsStep, number>
>({
  key: 'onboardingRewardCreditsByStepSelector',
  get: ({ get }) => {
    const onboardingConfig = get(onboardingConfigState);

    if (!isDefined(onboardingConfig)) {
      return {
        importContacts: 0,
        installApps: 0,
        createProfile: 0,
        inviteTeam: 0,
        upgradeTrial: 0,
      };
    }

    return getOnboardingRewardCreditsByStep({
      onboardingConfig,
      isWorkspaceCreator: get(currentUserState)?.isWorkspaceCreator ?? false,
      isPlanRequired: getIsPlanRequired({
        isBillingEnabled: get(billingState)?.isBillingEnabled ?? false,
        currentWorkspace: get(currentWorkspaceState),
      }),
    });
  },
});
