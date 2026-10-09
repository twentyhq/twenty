import { useContext } from 'react';

import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { useShouldShowAiChatEmptyState } from '@/ai/hooks/useShouldShowAiChatEmptyState';

export const useIsAiChatComposerCentered = () => {
  const aiChatSurface = useContext(AiChatSurfaceContext);
  // The workspace setup preamble is its own intro; centering would fight it.
  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();
  const shouldShowAiChatEmptyState = useShouldShowAiChatEmptyState();

  return (
    aiChatSurface === AI_CHAT_SURFACE.PAGE &&
    !isWorkspaceSetupChat &&
    shouldShowAiChatEmptyState
  );
};
