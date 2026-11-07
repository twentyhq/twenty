import { createContext } from 'react';

import { type HostScrollController } from '@/host/scroll/types/HostScrollController';

export const FrontComponentHostScrollControllerContext =
  createContext<HostScrollController | null>(null);
