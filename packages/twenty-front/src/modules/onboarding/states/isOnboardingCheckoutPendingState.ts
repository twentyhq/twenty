import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Survives the full-page round trip to Stripe and back, so the payment-success
// page can tell an onboarding checkout apart from any other way of reaching it.
export const isOnboardingCheckoutPendingState = createAtomState<boolean>({
  key: 'isOnboardingCheckoutPendingState',
  defaultValue: false,
  useSessionStorage: true,
});
