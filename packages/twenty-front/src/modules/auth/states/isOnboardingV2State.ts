import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isOnboardingV2State = createAtomState<boolean>({
  key: 'isOnboardingV2State',
  defaultValue: false,
});
