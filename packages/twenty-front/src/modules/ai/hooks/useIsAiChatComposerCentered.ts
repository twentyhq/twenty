import { useContext } from 'react';

import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { useShouldShowAiChatEmptyState } from '@/ai/hooks/useShouldShowAiChatEmptyState';
import { agentChatThreadIsDirectMessageFamilySelector } from '@/ai/states/selectors/agentChatThreadIsDirectMessageFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsAiChatComposerCentered = () => {
  const aiChatSurface = useContext(AiChatSurfaceContext);
  // The workspace setup preamble is its own intro; centering would fight it.
  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();
  const shouldShowAiChatEmptyState = useShouldShowAiChatEmptyState();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const isDirectMessage = useAtomFamilySelectorValue(
    agentChatThreadIsDirectMessageFamilySelector,
    currentAiChatThread,
  );

  return (
    aiChatSurface === AI_CHAT_SURFACE.PAGE &&
    !isDirectMessage &&
    !isWorkspaceSetupChat &&
    shouldShowAiChatEmptyState
  );
};
