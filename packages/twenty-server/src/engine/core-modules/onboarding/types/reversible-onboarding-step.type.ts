import { OnboardingStatus } from 'src/engine/core-modules/onboarding/enums/onboarding-status.enum';

export type ReversibleOnboardingStep =
  | OnboardingStatus.SYNC_EMAIL
  | OnboardingStatus.PROFILE_CREATION
  | OnboardingStatus.INVITE_TEAM
  | OnboardingStatus.BOOK_CALL;
