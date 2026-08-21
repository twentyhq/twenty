import { OnboardingStatus } from '~/generated-metadata/graphql';

export const getHasAdvancedPastBookCallStep = (
  onboardingStatus: OnboardingStatus | null | undefined,
) =>
  onboardingStatus === OnboardingStatus.PLAN_REQUIRED ||
  onboardingStatus === OnboardingStatus.COMPLETED;
