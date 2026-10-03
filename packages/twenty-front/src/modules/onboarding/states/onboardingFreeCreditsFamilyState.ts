import { ONBOARDING_FREE_CREDITS_DEFAULT_VALUE } from '@/onboarding/constants/OnboardingFreeCreditsDefaultValue';
import { type OnboardingFreeCredits } from '@/onboarding/types/OnboardingFreeCredits';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const onboardingFreeCreditsFamilyState = createAtomFamilyState<
  OnboardingFreeCredits,
  string
>({
  key: 'onboardingFreeCreditsFamilyState',
  defaultValue: ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
