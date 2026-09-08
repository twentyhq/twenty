import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsWorkspaceSetupChat = () =>
  useAtomStateValue(shouldOpenAiChatAfterOnboardingState);
