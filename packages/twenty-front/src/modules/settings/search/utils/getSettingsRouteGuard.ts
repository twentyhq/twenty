import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import { SettingsProtectedRouteWrapper } from '@/settings/components/SettingsProtectedRouteWrapper';
import { type SettingsRouteGuard } from '@/settings/search/types/SettingsSearchRoute';
import { isValidElement } from 'react';

export const getSettingsRouteGuard = (
  routeObject: WorkspaceRouteObject,
): SettingsRouteGuard | undefined =>
  isValidElement<SettingsRouteGuard>(routeObject.element) &&
  routeObject.element.type === SettingsProtectedRouteWrapper
    ? routeObject.element.props
    : undefined;
