import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import { createContext } from 'react';

export const WorkspaceRouteObjectsContext = createContext<
  WorkspaceRouteObject[]
>([]);
