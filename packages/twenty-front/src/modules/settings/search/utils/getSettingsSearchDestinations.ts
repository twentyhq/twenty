import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import { SettingsProtectedRouteWrapper } from '@/settings/components/SettingsProtectedRouteWrapper';
import { type SettingsSearchDestination } from '@/settings/search/types/SettingsSearchDestination';
import { type SettingsSearchRouteHandle } from '@/settings/search/types/SettingsSearchRouteHandle';
import { type SettingsSearchRouteMetadata } from '@/settings/search/types/SettingsSearchRouteMetadata';
import { isSettingsRouteAccessible } from '@/settings/utils/isSettingsRouteAccessible';
import { type I18n } from '@lingui/core';
import { isValidElement, type ComponentProps } from 'react';
import { SettingsPath } from 'twenty-shared/types';
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

const SETTINGS_PATHS = new Set<string>(Object.values(SettingsPath));

const isSettingsPathValue = (path: string): path is SettingsPath =>
  SETTINGS_PATHS.has(path);

const getSettingsSearchMetadata = (
  handle: SettingsSearchRouteHandle | undefined,
) => handle?.settingsSearch;

const collectSettingsSearchRoutes = ({
  routeObjects,
  parentGuards,
}: {
  routeObjects: WorkspaceRouteObject[];
  parentGuards: SettingsRouteGuard[];
}): SettingsSearchRoute[] =>
  routeObjects.flatMap((routeObject) => {
    const guard = getRouteGuard(routeObject);
    const guards = isDefined(guard) ? [...parentGuards, guard] : parentGuards;
    const metadata = getSettingsSearchMetadata(routeObject.handle);
    const path = routeObject.path;
    const childRoutes = collectSettingsSearchRoutes({
      routeObjects: routeObject.children ?? [],
      parentGuards: guards,
    });

    if (
      !isDefined(metadata) ||
      metadata === false ||
      !isDefined(path) ||
      !isSettingsPathValue(path)
    ) {
      return childRoutes;
    }

    return [{ path, metadata, guards }, ...childRoutes];
  });

const isRouteAvailable = ({
  route: { metadata, guards },
  availability,
}: {
  route: SettingsSearchRoute;
  availability: SettingsSearchAvailability;
}) =>
  (availability.isBillingEnabled ||
    metadata.isHiddenWhenBillingDisabled !== true) &&
  guards.every(({ settingsPermission, requiredFeatureFlag }) =>
    isSettingsRouteAccessible({
      hasPermission: availability.permissionFlagMap[settingsPermission],
      requiredFeatureFlag,
      isRequiredFeatureFlagEnabled:
        isDefined(requiredFeatureFlag) &&
        availability.featureFlagsMap[requiredFeatureFlag],
    }),
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
  const routes = collectSettingsSearchRoutes({
    routeObjects,
    parentGuards: [],
  });
  const metadataByPath = new Map(
    routes.map((route) => [route.path, route.metadata]),
  );

  const getBreadcrumbs = (metadata: SettingsSearchRouteMetadata): string[] => {
    if ('section' in metadata) {
      return [i18n._(metadata.section)];
    }

    const parentMetadata = metadataByPath.get(metadata.parentPath);

    return isDefined(parentMetadata)
      ? [...getBreadcrumbs(parentMetadata), i18n._(parentMetadata.title)]
      : [];
  };

  return routes
    .filter((route) => isRouteAvailable({ route, availability }))
    .map(({ path, metadata }) => ({
      id: `settings-search-${path}`,
      path: getSettingsPath(path),
      title: i18n._(metadata.title),
      breadcrumbs: getBreadcrumbs(metadata),
      keywords: (metadata.keywords ?? []).map((keyword) => i18n._(keyword)),
    }));
};
