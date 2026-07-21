import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isOnboardingCheckoutPendingState = createAtomState<boolean>({
  key: 'isOnboardingCheckoutPendingState',
  defaultValue: false,
  useSessionStorage: true,
});
