import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { ONBOARDING_FREE_CREDITS_DEFAULT_VALUE } from '@/onboarding/constants/OnboardingFreeCreditsDefaultValue';
import { onboardingFreeCreditsFamilyState } from '@/onboarding/states/onboardingFreeCreditsFamilyState';
import { type OnboardingFreeCredits } from '@/onboarding/types/OnboardingFreeCredits';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isDefined } from 'twenty-shared/utils';

export const currentWorkspaceOnboardingFreeCreditsSelector =
  createAtomSelector<OnboardingFreeCredits>({
    key: 'currentWorkspaceOnboardingFreeCreditsSelector',
    get: ({ get }) => {
      const currentWorkspace = get(currentWorkspaceState);

      if (!isDefined(currentWorkspace)) {
        return ONBOARDING_FREE_CREDITS_DEFAULT_VALUE;
      }

      return {
        ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
        ...get(onboardingFreeCreditsFamilyState, currentWorkspace.id),
      };
    },
  });
