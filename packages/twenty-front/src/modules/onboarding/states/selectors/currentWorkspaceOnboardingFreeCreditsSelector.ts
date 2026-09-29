import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { ONBOARDING_FREE_CREDITS_DEFAULT_VALUE } from '@/onboarding/constants/OnboardingFreeCreditsDefaultValue';
import { onboardingCreateProfileDraftState } from '@/onboarding/states/onboardingCreateProfileDraftState';
import { onboardingFreeCreditsFamilyState } from '@/onboarding/states/onboardingFreeCreditsFamilyState';
import { onboardingRewardCreditsByStepSelector } from '@/onboarding/states/selectors/onboardingRewardCreditsByStepSelector';
import { type OnboardingFreeCredits } from '@/onboarding/types/OnboardingFreeCredits';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { OnboardingStatus } from '~/generated-metadata/graphql';

export const currentWorkspaceOnboardingFreeCreditsSelector =
  createAtomSelector<OnboardingFreeCredits>({
    key: 'currentWorkspaceOnboardingFreeCreditsSelector',
    get: ({ get }) => {
      const currentWorkspace = get(currentWorkspaceState);

      if (!isDefined(currentWorkspace)) {
        return ONBOARDING_FREE_CREDITS_DEFAULT_VALUE;
      }

      const storedFreeCredits = {
        ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
        ...get(onboardingFreeCreditsFamilyState, currentWorkspace.id),
      };

      if (
        get(currentUserState)?.onboardingStatus !==
        OnboardingStatus.PROFILE_CREATION
      ) {
        return storedFreeCredits;
      }

      const profileName =
        get(onboardingCreateProfileDraftState) ??
        get(currentWorkspaceMemberState)?.name;

      return {
        ...storedFreeCredits,
        createProfile:
          isNonEmptyString(profileName?.firstName) &&
          isNonEmptyString(profileName?.lastName)
            ? get(onboardingRewardCreditsByStepSelector).createProfile
            : 0,
      };
    },
  });
