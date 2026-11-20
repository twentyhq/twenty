import { useContext } from 'react';
import { AiChatSurfaceContext } from '@/ai-chat/contexts/AiChatSurfaceContext';
import { AI_CHAT_SURFACE } from '@/ai-chat/constants/AiChatSurface';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useIsWorkspaceSetupChat } from '@/ai-chat/workspace-setup/hooks/useIsWorkspaceSetupChat';
import { useReturnFromExpandedAiChat } from '@/ai-chat/hooks/useReturnFromExpandedAiChat';
import { processedWorkspaceSetupCompletionIdsState } from '@/ai-chat/workspace-setup/states/processedWorkspaceSetupCompletionIdsState';
import { extractCompletedWorkspaceSetupToolParts } from '@/ai-chat/workspace-setup/utils/extractCompletedWorkspaceSetupToolParts';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { isSettingsPath } from '~/utils/isSettingsPath';
import { useStore } from 'jotai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

export const useProcessWorkspaceSetupCompletion = () => {
  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();
  const aiChatSurface = useContext(AiChatSurfaceContext);
  const { defaultHomePagePath } = useDefaultHomePagePath();

  const returnFromExpandedAiChat = useReturnFromExpandedAiChat({
    reopenSidePanel: !isSettingsPath(defaultHomePagePath),
    destinationPath: defaultHomePagePath,
  });

  const store = useStore();

  const processWorkspaceSetupCompletion = (
    message: Pick<ExtendedUIMessage, 'parts'>,
  ) => {
    const processedCompletionIds = store.get(
      processedWorkspaceSetupCompletionIdsState.atom,
    );
    const completionIds = new Set([
      ...processedCompletionIds,
      ...extractCompletedWorkspaceSetupToolParts(message.parts).map(
        (part) => part.toolCallId,
      ),
    ]);

    if (completionIds.size === processedCompletionIds.length) {
      return;
    }

    store.set(processedWorkspaceSetupCompletionIdsState.atom, [
      ...completionIds,
    ]);

    if (!isWorkspaceSetupChat) {
      return;
    }

    if (aiChatSurface === AI_CHAT_SURFACE.PAGE) {
      returnFromExpandedAiChat();
    } else {
      store.set(shouldOpenAiChatAfterOnboardingState.atom, false);
    }
  };

  return {
    processWorkspaceSetupCompletion,
  };
};
