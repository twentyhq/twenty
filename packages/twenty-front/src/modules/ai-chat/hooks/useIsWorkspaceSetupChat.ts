import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { AiChatSurfaceContext } from '@/ai-chat/contexts/AiChatSurfaceContext';
import { shouldOpenAiChatAfterOnboardingState } from '@/ai-chat/states/shouldOpenAiChatAfterOnboardingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsWorkspaceSetupChat = () => {
  const surface = useContext(AiChatSurfaceContext);
  const shouldOpenAiChatAfterOnboarding = useAtomStateValue(
    shouldOpenAiChatAfterOnboardingState,
  );

  return shouldOpenAiChatAfterOnboarding && isDefined(surface);
};
