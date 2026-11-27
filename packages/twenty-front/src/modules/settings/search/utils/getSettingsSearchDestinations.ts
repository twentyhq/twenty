import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsProtectedRouteWrapper } from '@/settings/components/SettingsProtectedRouteWrapper';
import { SETTINGS_SEARCH_OBJECT_LABEL_TITLE } from '@/settings/search/constants/SettingsSearchObjectLabelTitle';
import { type SettingsSearchDestination } from '@/settings/search/types/SettingsSearchDestination';
import { type SettingsSearchRouteHandle } from '@/settings/search/types/SettingsSearchRouteHandle';
import { type SettingsSearchRouteMetadata } from '@/settings/search/types/SettingsSearchRouteMetadata';
import { getAvailableSettingsTabs } from '@/settings/utils/getAvailableSettingsTabs';
import { isSettingsRouteAccessible } from '@/settings/utils/isSettingsRouteAccessible';
import { type I18n } from '@lingui/core';
import { isValidElement, type ComponentProps } from 'react';
import { generatePath } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { type PermissionFlagType } from '~/generated-metadata/graphql';

type SettingsRouteGuard = ComponentProps<typeof SettingsProtectedRouteWrapper>;

type SettingsSearchRoute = {
  path: SettingsPath;
  metadata: SettingsSearchRouteMetadata;
  guards: SettingsRouteGuard[];
};

type SettingsSearchObject = Pick<
  EnrichedObjectMetadataItem,
  'namePlural' | 'labelPlural' | 'labelSingular'
>;

export type SettingsSearchAvailability = {
  permissionFlagMap: Record<PermissionFlagType, boolean>;
  featureFlagsMap: Record<string, boolean>;
  isBillingEnabled: boolean;
  objectMetadataItems: SettingsSearchObject[];
};

const OBJECT_PATH_PARAMETER = ':objectNamePlural';

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
  (availability.isBillingEnabled || metadata.requiresBillingEnabled !== true) &&
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

  const getTitle = (
    { title }: SettingsSearchRouteMetadata,
    objectMetadataItem: SettingsSearchObject | undefined,
  ) =>
    title === SETTINGS_SEARCH_OBJECT_LABEL_TITLE
      ? (objectMetadataItem?.labelPlural ?? '')
      : i18n._(title);

  const getBreadcrumbs = (
    metadata: SettingsSearchRouteMetadata,
    objectMetadataItem: SettingsSearchObject | undefined,
  ): string[] => {
    if ('section' in metadata) {
      return [i18n._(metadata.section)];
    }

    const parentMetadata = metadataByPath.get(metadata.parentPath);

    return isDefined(parentMetadata)
      ? [
          ...getBreadcrumbs(parentMetadata, objectMetadataItem),
          getTitle(parentMetadata, objectMetadataItem),
        ]
      : [];
  };

  const getPathObjects = (path: SettingsPath) => {
    if (path.includes(OBJECT_PATH_PARAMETER)) {
      return availability.objectMetadataItems;
    }

    return path.includes(':') ? [] : [undefined];
  };

  return routes
    .filter((route) => isRouteAvailable({ route, availability }))
    .flatMap(({ path, metadata }) =>
      getPathObjects(path).flatMap((objectMetadataItem) => {
        const pagePath = isDefined(objectMetadataItem)
          ? generatePath(getSettingsPath(path), {
              objectNamePlural: objectMetadataItem.namePlural,
            })
          : getSettingsPath(path);
        const title = getTitle(metadata, objectMetadataItem);
        const breadcrumbs = getBreadcrumbs(metadata, objectMetadataItem);
        const isObjectPage =
          metadata.title === SETTINGS_SEARCH_OBJECT_LABEL_TITLE;
        const tabs = getAvailableSettingsTabs({
          tabs: metadata.tabs ?? [],
          permissionFlagMap: availability.permissionFlagMap,
        });

        return [
          {
            id: `settings-search-${pagePath}`,
            path: pagePath,
            title,
            breadcrumbs,
            keywords: [
              ...(metadata.keywords ?? []).map((keyword) => i18n._(keyword)),
              ...(isObjectPage && isDefined(objectMetadataItem)
                ? [objectMetadataItem.labelSingular]
                : []),
            ],
          },
          ...tabs.map((tab) => ({
            id: `settings-search-${pagePath}#${tab.id}`,
            path: `${pagePath}#${tab.id}`,
            title: i18n._(tab.title),
            breadcrumbs: [...breadcrumbs, title],
            keywords: [],
          })),
        ];
      }),
    );
};
