import { createContext } from 'react';

import { type GeometryTracker } from '@/host/types/GeometryTracker';

export const FrontComponentGeometryTrackerContext =
  createContext<GeometryTracker | null>(null);
