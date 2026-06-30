import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const onboardingConfigState = createAtomState<OnboardingConfig | null>({
  key: 'onboardingConfigState',
  defaultValue: null,
});
