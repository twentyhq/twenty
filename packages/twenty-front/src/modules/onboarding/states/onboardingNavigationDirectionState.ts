import { type OnboardingNavigationDirection } from '@/onboarding/types/OnboardingNavigationDirection';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const onboardingNavigationDirectionState =
  createAtomState<OnboardingNavigationDirection>({
    key: 'onboardingNavigationDirectionState',
    defaultValue: 'forward',
  });
