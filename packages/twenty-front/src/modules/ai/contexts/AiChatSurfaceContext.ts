import { createContext } from 'react';

import { type InboxSurface } from '@/ai/types/AiChatSurface';

export const InboxSurfaceContext = createContext<InboxSurface | undefined>(
  undefined,
);
