import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { useContext } from 'react';

import { AI_CHAT_SURFACE } from '@/ai-chat/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai-chat/contexts/AiChatSurfaceContext';
import { useIsWorkspaceSetupChat } from '@/ai-chat/hooks/useIsWorkspaceSetupChat';
import { useShouldShowAiChatEmptyState } from '@/ai-chat/hooks/useShouldShowAiChatEmptyState';
import { aiChatThreadIsDirectMessageFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadIsDirectMessageFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

export const useIsAiChatComposerCentered = () => {
  const aiChatSurface = useContext(AiChatSurfaceContext);
  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();
  const shouldShowAiChatEmptyState = useShouldShowAiChatEmptyState();
  const { threadId } = useAiChatInstanceOrThrow();
  const isDirectMessage = useAtomFamilySelectorValue(
    aiChatThreadIsDirectMessageFamilySelector,
    threadId,
  );

  return (
    aiChatSurface === AI_CHAT_SURFACE.PAGE &&
    !isDirectMessage &&
    !isWorkspaceSetupChat &&
    shouldShowAiChatEmptyState
  );
};
