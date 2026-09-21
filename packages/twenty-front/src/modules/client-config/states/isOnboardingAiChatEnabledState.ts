import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isOnboardingAiChatEnabledState = createAtomState<boolean>({
  key: 'isOnboardingAiChatEnabledState',
  defaultValue: false,
});
