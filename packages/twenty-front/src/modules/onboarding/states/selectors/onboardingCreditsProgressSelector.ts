import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { currentWorkspaceOnboardingFreeCreditsSelector } from '@/onboarding/states/selectors/currentWorkspaceOnboardingFreeCreditsSelector';
import { type OnboardingCreditsProgress } from '@/onboarding/types/OnboardingCreditsProgress';
import { getIsPlanRequired } from '@/onboarding/utils/getIsPlanRequired';
import { getOnboardingCreditsProgress } from '@/onboarding/utils/getOnboardingCreditsProgress';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const onboardingCreditsProgressSelector =
  createAtomSelector<OnboardingCreditsProgress | null>({
    key: 'onboardingCreditsProgressSelector',
    get: ({ get }) => {
      const onboardingConfig = get(onboardingConfigState);

      if (!isDefined(onboardingConfig)) {
        return null;
      }

      const currentUser = get(currentUserState);

      return getOnboardingCreditsProgress({
        onboardingFreeCredits: get(
          currentWorkspaceOnboardingFreeCreditsSelector,
        ),
        onboardingConfig,
        onboardingStatus: currentUser?.onboardingStatus,
        isWorkspaceCreator: currentUser?.isWorkspaceCreator ?? false,
        isPlanRequired: getIsPlanRequired({
          isBillingEnabled: get(billingState)?.isBillingEnabled ?? false,
          currentWorkspace: get(currentWorkspaceState),
        }),
      });
    },
    areEqual: isDeeplyEqual,
  });
