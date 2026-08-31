import { useWorkspaceRouteObjects } from '@/app/routing/hooks/useWorkspaceRouteObjects';
import { type WorkspaceSurfaceType } from '@/app/routing/types/WorkspaceRouteObject';
import { getWorkspaceRouteElementsForSurface } from '@/app/routing/utils/getWorkspaceRouteElementsForSurface';
import { isWorkspaceLocationAvailableOnSurface } from '@/app/routing/utils/isWorkspaceLocationAvailableOnSurface';
import { type ReactNode } from 'react';
import {
  createRoutesFromElements,
  type Location,
  useRoutes,
} from 'react-router-dom';

export const WorkspaceRoutes = ({
  surface,
  location,
  fallback = null,
}: {
  surface: WorkspaceSurfaceType;
  location?: Partial<Location> | string;
  fallback?: ReactNode;
}) => {
  const routeObjects = useWorkspaceRouteObjects();

  const surfaceRouteObjects = createRoutesFromElements(
    getWorkspaceRouteElementsForSurface(routeObjects, surface),
  );

  const routedElement = useRoutes(surfaceRouteObjects, location);
  const isLocationAvailable =
    location === undefined ||
    isWorkspaceLocationAvailableOnSurface(routeObjects, surface, location);

  return isLocationAvailable ? (routedElement ?? fallback) : fallback;
};
