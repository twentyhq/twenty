import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import { createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';

export const WorkspaceRouteObjectsContext = createContext<
  WorkspaceRouteObject[]
>([]);

export const useWorkspaceRouteObjects = () =>
  useContext(WorkspaceRouteObjectsContext);

export const WorkspaceRouteObjectsProvider = ({
  routeObjects,
}: {
  routeObjects: WorkspaceRouteObject[];
}) => (
  <WorkspaceRouteObjectsContext.Provider value={routeObjects}>
    <Outlet />
  </WorkspaceRouteObjectsContext.Provider>
);
