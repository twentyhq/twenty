import { type Location, type NonIndexRouteObject } from 'react-router-dom';

export type WorkspaceSurfaceType = 'main' | 'side-panel';

export type WorkspaceRouteHandle = {
  workspaceSurfaces: readonly WorkspaceSurfaceType[];
  isLocationAvailableOnSurface?: (args: {
    surface: WorkspaceSurfaceType;
    location: Partial<Location> | string;
  }) => boolean;
  isLocationExpandableFromSidePanel?: (args: {
    location: Partial<Location> | string;
  }) => boolean;
};

export type WorkspaceRouteObject = Omit<
  NonIndexRouteObject,
  'children' | 'handle'
> & {
  children?: WorkspaceRouteObject[];
  handle?: WorkspaceRouteHandle;
};
