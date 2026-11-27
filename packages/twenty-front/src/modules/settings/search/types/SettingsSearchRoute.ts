import { type SettingsProtectedRouteWrapper } from '@/settings/components/SettingsProtectedRouteWrapper';
import { type SettingsSearchRouteMetadata } from '@/settings/search/types/SettingsSearchRouteMetadata';
import { type ComponentProps } from 'react';
import { type SettingsPath } from 'twenty-shared/types';

export type SettingsRouteGuard = ComponentProps<
  typeof SettingsProtectedRouteWrapper
>;

export type SettingsSearchRoute = {
  path: SettingsPath;
  metadata: SettingsSearchRouteMetadata;
  guards: SettingsRouteGuard[];
};
