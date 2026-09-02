import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AiChatMessageListPreambleContext } from '@/ai/contexts/AiChatMessageListPreambleContext';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { useShouldShowAiChatEmptyState } from '@/ai/hooks/useShouldShowAiChatEmptyState';

export const useIsAiChatComposerCentered = () => {
  const aiChatSurface = useContext(AiChatSurfaceContext);
  // A preamble is its own choreographed intro (onboarding); centering the
  // composer would fight with it.
  const messageListPreamble = useContext(AiChatMessageListPreambleContext);
  const shouldShowAiChatEmptyState = useShouldShowAiChatEmptyState();

  return (
    aiChatSurface === AI_CHAT_SURFACE.PAGE &&
    !isDefined(messageListPreamble) &&
    shouldShowAiChatEmptyState
  );
};
