import { WorkspaceRouteObjectsContext } from '@/app/routing/contexts/WorkspaceRouteObjectsContext';
import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import { Outlet } from 'react-router-dom';

export const WorkspaceRouteObjectsProvider = ({
  routeObjects,
}: {
  routeObjects: WorkspaceRouteObject[];
}) => (
  <WorkspaceRouteObjectsContext.Provider value={routeObjects}>
    <Outlet />
  </WorkspaceRouteObjectsContext.Provider>
);
