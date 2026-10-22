import { createContext } from 'react';

import { type HostPointerCaptureController } from '@/host/events/types/HostPointerCaptureController';

export const FrontComponentPointerCaptureControllerContext =
  createContext<HostPointerCaptureController | null>(null);
