import { OnboardingStatus } from 'src/engine/core-modules/onboarding/enums/onboarding-status.enum';

export type ReversibleOnboardingStep =
  | OnboardingStatus.SYNC_EMAIL
  | OnboardingStatus.APPS_INSTALLATION
  | OnboardingStatus.PROFILE_CREATION
  | OnboardingStatus.INVITE_TEAM;
