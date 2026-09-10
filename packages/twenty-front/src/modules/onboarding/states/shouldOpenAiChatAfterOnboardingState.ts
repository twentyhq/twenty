import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const shouldOpenAiChatAfterOnboardingState = createAtomState<boolean>({
  key: 'shouldOpenAiChatAfterOnboardingState',
  defaultValue: false,
  useSessionStorage: true,
});
