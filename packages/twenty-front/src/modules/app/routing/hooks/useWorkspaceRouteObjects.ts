import { WorkspaceRouteObjectsContext } from '@/app/routing/contexts/WorkspaceRouteObjectsContext';
import { useContext } from 'react';

export const useWorkspaceRouteObjects = () =>
  useContext(WorkspaceRouteObjectsContext);
