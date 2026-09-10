import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { createContext } from 'react';

export type WorkspaceSurfaceContextValue = {
  type: 'main' | 'side-panel';
  instanceId: string;
  // Present only when a routed surface owns flow-local editor and UI state.
  routedFlowStateScopeId?: string;
  ownsRouteLocation: boolean;
};

export const WorkspaceSurfaceContext =
  createContext<WorkspaceSurfaceContextValue>({
    type: 'main',
    instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    ownsRouteLocation: true,
  });
