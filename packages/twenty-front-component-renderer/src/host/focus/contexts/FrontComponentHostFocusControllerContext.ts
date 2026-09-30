import { createContext } from 'react';

import { type HostFocusController } from '@/host/focus/types/HostFocusController';

export const FrontComponentHostFocusControllerContext =
  createContext<HostFocusController | null>(null);
