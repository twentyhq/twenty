import { useContext } from 'react';

import { AiChatSurfaceContext } from '@/ai-chat/contexts/AiChatSurfaceContext';
import { shouldOpenAiChatAfterOnboardingState } from '@/ai-chat/states/shouldOpenAiChatAfterOnboardingState';
import { getIsWorkspaceSetupChat } from '@/ai-chat/utils/getIsWorkspaceSetupChat';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsWorkspaceSetupChat = () => {
  const surface = useContext(AiChatSurfaceContext);
  const shouldOpenAiChatAfterOnboarding = useAtomStateValue(
    shouldOpenAiChatAfterOnboardingState,
  );

  return getIsWorkspaceSetupChat({ surface, shouldOpenAiChatAfterOnboarding });
};
