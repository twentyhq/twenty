import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const onboardingActivationFailedState = createAtomState<boolean>({
  key: 'onboardingActivationFailedState',
  defaultValue: false,
});
