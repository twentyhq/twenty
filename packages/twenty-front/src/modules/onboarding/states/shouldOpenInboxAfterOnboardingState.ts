import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const shouldOpenInboxAfterOnboardingState = createAtomState<boolean>({
  key: 'shouldOpenAiChatAfterOnboardingState',
  defaultValue: false,
  useSessionStorage: true,
});
