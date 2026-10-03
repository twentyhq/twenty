import { useContext } from 'react';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { useReturnFromExpandedAiChat } from '@/ai/hooks/useReturnFromExpandedAiChat';
import { useClaimUnprocessedToolCallParts } from '@/ai/hooks/useClaimUnprocessedToolCallParts';
import { extractCompletedWorkspaceSetupToolParts } from '@/ai/utils/extractCompletedWorkspaceSetupToolParts';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { isSettingsPath } from '~/utils/isSettingsPath';
import { isNonEmptyArray } from '@sniptt/guards';
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

  const { claimUnprocessedToolCallParts } = useClaimUnprocessedToolCallParts();

  const store = useStore();

  const processWorkspaceSetupCompletion = (
    message: Pick<ExtendedUIMessage, 'parts'>,
  ) => {
    const claimedParts = claimUnprocessedToolCallParts(
      extractCompletedWorkspaceSetupToolParts(message.parts),
    );

    if (!isNonEmptyArray(claimedParts) || !isWorkspaceSetupChat) {
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
