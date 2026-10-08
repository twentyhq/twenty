import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isBookCallOnboardingStepEnabledState = createAtomState<boolean>({
  key: 'isBookCallOnboardingStepEnabledState',
  defaultValue: false,
});
