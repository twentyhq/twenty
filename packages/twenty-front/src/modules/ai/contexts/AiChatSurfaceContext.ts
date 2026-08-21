import { createContext } from 'react';

import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { type AiChatSurface } from '@/ai/types/AiChatSurface';

export const AiChatSurfaceContext = createContext<AiChatSurface>(
  AI_CHAT_SURFACE.SIDE_PANEL,
);
