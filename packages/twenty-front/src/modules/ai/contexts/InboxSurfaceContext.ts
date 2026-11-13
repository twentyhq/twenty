import { createContext } from 'react';

import { type InboxSurface } from '@/ai/types/InboxSurface';

export const InboxSurfaceContext = createContext<InboxSurface | undefined>(
  undefined,
);
