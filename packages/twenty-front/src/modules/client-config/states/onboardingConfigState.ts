import { type OnboardingConfig } from '~/generated-metadata/graphql';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const onboardingConfigState = createAtomState<OnboardingConfig | null>({
  key: 'onboardingConfigState',
  defaultValue: null,
});
