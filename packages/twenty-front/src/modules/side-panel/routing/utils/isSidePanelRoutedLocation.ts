import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import { isWorkspaceLocationAvailableOnSurface } from '@/app/routing/utils/isWorkspaceLocationAvailableOnSurface';
import { type Location } from 'react-router-dom';

export const isSidePanelRoutedLocation = (
  routeObjects: WorkspaceRouteObject[],
  location: Partial<Location> | string,
) =>
  isWorkspaceLocationAvailableOnSurface(routeObjects, 'side-panel', location);
