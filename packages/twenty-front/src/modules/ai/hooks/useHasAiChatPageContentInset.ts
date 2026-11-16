import { useContext } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';

import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';

export const useHasAiChatPageContentInset = () => {
  const aiChatSurface = useContext(AiChatSurfaceContext);
  const isMobile = useIsMobile();

  return aiChatSurface === AI_CHAT_SURFACE.PAGE && !isMobile;
};
