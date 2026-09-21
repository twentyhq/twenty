import { createContext } from 'react';

import { type AiChatSurface } from '@/ai/types/AiChatSurface';

export const AiChatSurfaceContext = createContext<AiChatSurface | undefined>(
  undefined,
);
