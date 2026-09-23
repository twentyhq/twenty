import { type OnboardingHomeIllustrationPoint } from '@/onboarding/components/OnboardingHomeIllustration/onboardingHomeIllustrationFurniture.type';

// The window frame runs behind the plant and the chair: without it the empty
// room would show a window with a missing corner.
export const ONBOARDING_HOME_ILLUSTRATION_ROOM_LINES: readonly {
  start: OnboardingHomeIllustrationPoint;
  end: OnboardingHomeIllustrationPoint;
  thickness: number;
}[] = [
  { start: [0.458, 0.14], end: [0.458, 0.545], thickness: 0.022 },
  { start: [0.45, 0.536], end: [1, 0.546], thickness: 0.012 },
];
