import { type WorkspaceRouteHandle } from '@/app/routing/types/WorkspaceRouteObject';
import { type SettingsSearchRouteMetadata } from '@/settings/search/types/SettingsSearchRouteMetadata';

export type SettingsSearchRouteHandle = WorkspaceRouteHandle & {
  settingsSearch?: SettingsSearchRouteMetadata;
};
