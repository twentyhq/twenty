import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import { SettingsProtectedRouteWrapper } from '@/settings/components/SettingsProtectedRouteWrapper';
import { type SettingsSearchDestination } from '@/settings/search/types/SettingsSearchDestination';
import { type SettingsSearchRouteMetadata } from '@/settings/search/types/SettingsSearchRouteMetadata';
import { type I18n } from '@lingui/core';
import { isValidElement, type ComponentProps } from 'react';
import { type SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { type PermissionFlagType } from '~/generated-metadata/graphql';

type SettingsRouteGuard = ComponentProps<typeof SettingsProtectedRouteWrapper>;

type SettingsSearchRoute = {
  path: SettingsPath;
  metadata: SettingsSearchRouteMetadata;
  guards: SettingsRouteGuard[];
};

export type SettingsSearchAvailability = {
  permissionFlagMap: Record<PermissionFlagType, boolean>;
  featureFlagsMap: Record<string, boolean>;
  isBillingEnabled: boolean;
};

const getRouteGuard = (
  routeObject: WorkspaceRouteObject,
): SettingsRouteGuard | undefined =>
  isValidElement<SettingsRouteGuard>(routeObject.element) &&
  routeObject.element.type === SettingsProtectedRouteWrapper
    ? routeObject.element.props
    : undefined;

const collectSettingsSearchRoutes = (
  routeObjects: WorkspaceRouteObject[],
  parentGuards: SettingsRouteGuard[] = [],
): SettingsSearchRoute[] =>
  routeObjects.flatMap((routeObject) => {
    const guard = getRouteGuard(routeObject);
    const guards = isDefined(guard) ? [...parentGuards, guard] : parentGuards;
    const metadata = routeObject.handle?.settingsSearch;
    const childRoutes = collectSettingsSearchRoutes(
      routeObject.children ?? [],
      guards,
    );

    if (!isDefined(metadata) || !isDefined(routeObject.path)) {
      return childRoutes;
    }

    return [
      { path: routeObject.path as SettingsPath, metadata, guards },
      ...childRoutes,
    ];
  });

const isRouteAvailable = (
  { metadata, guards }: SettingsSearchRoute,
  availability: SettingsSearchAvailability,
) =>
  (availability.isBillingEnabled || metadata.isBillingRequired !== true) &&
  guards.every(
    ({ settingsPermission, requiredFeatureFlag }) =>
      availability.permissionFlagMap[settingsPermission] &&
      (!isDefined(requiredFeatureFlag) ||
        availability.featureFlagsMap[requiredFeatureFlag] === true),
  );

export const getSettingsSearchDestinations = ({
  routeObjects,
  availability,
  i18n,
}: {
  routeObjects: WorkspaceRouteObject[];
  availability: SettingsSearchAvailability;
  i18n: I18n;
}): SettingsSearchDestination[] => {
  const routes = collectSettingsSearchRoutes(routeObjects);
  const metadataByPath = new Map(
    routes.map((route) => [route.path, route.metadata]),
  );

  const getBreadcrumbs = (metadata: SettingsSearchRouteMetadata): string[] => {
    const parentMetadata = isDefined(metadata.parentPath)
      ? metadataByPath.get(metadata.parentPath)
      : undefined;

    if (isDefined(parentMetadata)) {
      return [...getBreadcrumbs(parentMetadata), i18n._(parentMetadata.title)];
    }

    return isDefined(metadata.section) ? [i18n._(metadata.section)] : [];
  };

  return routes
    .filter((route) => isRouteAvailable(route, availability))
    .map(({ path, metadata }) => ({
      id: `settings-search-${path}`,
      path: getSettingsPath(path),
      title: i18n._(metadata.title),
      breadcrumbs: getBreadcrumbs(metadata),
      keywords: (metadata.keywords ?? []).map((keyword) => i18n._(keyword)),
    }));
};
