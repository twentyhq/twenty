import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isOnboardingInboxEnabledState = createAtomState<boolean>({
  key: 'isOnboardingInboxEnabledState',
  defaultValue: false,
});
