import { OnboardingStatus } from '~/generated-metadata/graphql';

type ShouldShowWelcomeAnimationOnNavigateArgs = {
  onboardingStatus: OnboardingStatus | null | undefined;
  isOnOnboardingPage: boolean;
  isNavigatingToOnboardingOrAuthPath: boolean;
};

export const shouldShowWelcomeAnimationOnNavigate = ({
  onboardingStatus,
  isOnOnboardingPage,
  isNavigatingToOnboardingOrAuthPath,
}: ShouldShowWelcomeAnimationOnNavigateArgs): boolean =>
  onboardingStatus === OnboardingStatus.COMPLETED &&
  isOnOnboardingPage &&
  !isNavigatingToOnboardingOrAuthPath;
