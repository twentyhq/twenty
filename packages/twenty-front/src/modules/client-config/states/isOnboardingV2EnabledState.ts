import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isOnboardingV2EnabledState = createAtomState<boolean>({
  key: 'isOnboardingV2EnabledState',
  defaultValue: false,
});
