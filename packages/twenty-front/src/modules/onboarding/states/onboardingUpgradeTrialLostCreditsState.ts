import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const onboardingUpgradeTrialLostCreditsState = createAtomState<number>({
  key: 'onboardingUpgradeTrialLostCreditsState',
  defaultValue: 0,
});
