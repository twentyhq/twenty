import { createContext } from 'react';

import { type RequestExternalNavigation } from '@/host/types/RequestExternalNavigation';

export const FrontComponentExternalNavigationContext =
  createContext<RequestExternalNavigation | null>(null);
