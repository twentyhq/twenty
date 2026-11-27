import { type SettingsSearchRouteMetadata } from '@/settings/search/types/SettingsSearchRouteMetadata';
import { type Location, type NonIndexRouteObject } from 'react-router-dom';

export type WorkspaceSurfaceType = 'main' | 'side-panel';

export type WorkspaceRouteHandle = {
  workspaceSurfaces: readonly WorkspaceSurfaceType[];
  isLocationExpandableFromSidePanel?:
    | boolean
    | ((args: { location: Partial<Location> | string }) => boolean);
  settingsSearch?: SettingsSearchRouteMetadata;
};

export type WorkspaceRouteObject = Omit<
  NonIndexRouteObject,
  'children' | 'handle'
> & {
  children?: WorkspaceRouteObject[];
  handle?: WorkspaceRouteHandle;
};
