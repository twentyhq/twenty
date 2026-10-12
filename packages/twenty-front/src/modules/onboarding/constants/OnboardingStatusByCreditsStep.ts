import { type OnboardingCreditsStep } from '@/onboarding/types/OnboardingCreditsStep';
import { OnboardingStatus } from '~/generated-metadata/graphql';

export const ONBOARDING_STATUS_BY_CREDITS_STEP: Record<
  OnboardingCreditsStep,
  OnboardingStatus
> = {
  importContacts: OnboardingStatus.SYNC_EMAIL,
  createProfile: OnboardingStatus.PROFILE_CREATION,
  inviteTeam: OnboardingStatus.INVITE_TEAM,
  upgradeTrial: OnboardingStatus.PLAN_REQUIRED,
};
