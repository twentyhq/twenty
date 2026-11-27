import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsProtectedRouteWrapper } from '@/settings/components/SettingsProtectedRouteWrapper';
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
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

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

const OBJECT_PATH_PARAMETERS = [':objectNamePlural'];

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
  (availability.isBillingEnabled || !metadata.isHiddenWhenBillingDisabled) &&
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

  const getTitle = ({
    metadata: { title },
    objectMetadataItem,
  }: {
    metadata: SettingsSearchRouteMetadata;
    objectMetadataItem: SettingsSearchObject | undefined;
  }) =>
    isDefined(title) ? i18n._(title) : (objectMetadataItem?.labelPlural ?? '');

  const getBreadcrumbs = ({
    metadata,
    objectMetadataItem,
  }: {
    metadata: SettingsSearchRouteMetadata;
    objectMetadataItem: SettingsSearchObject | undefined;
  }): string[] => {
    if ('section' in metadata) {
      return [i18n._(metadata.section)];
    }

    const parentMetadata = metadataByPath.get(metadata.parentPath);

    return isDefined(parentMetadata)
      ? [
          ...getBreadcrumbs({
            metadata: parentMetadata,
            objectMetadataItem,
          }),
          getTitle({ metadata: parentMetadata, objectMetadataItem }),
        ]
      : [];
  };

  const getPathObjects = ({ path, metadata }: SettingsSearchRoute) => {
    const pathParameters = path.match(/:\w+/g) ?? [];

    if (pathParameters.length === 0) {
      return [undefined];
    }

    return metadata.isExpandedPerObject &&
      isDeeplyEqual(pathParameters, OBJECT_PATH_PARAMETERS)
      ? availability.objectMetadataItems
      : [];
  };

  return routes
    .filter((route) => isRouteAvailable({ route, availability }))
    .flatMap((route) =>
      getPathObjects(route).flatMap((objectMetadataItem) => {
        const { path, metadata } = route;
        const pagePath = isDefined(objectMetadataItem)
          ? generatePath(getSettingsPath(path), {
              objectNamePlural: objectMetadataItem.namePlural,
            })
          : getSettingsPath(path);
        const title = getTitle({ metadata, objectMetadataItem });
        const breadcrumbs = getBreadcrumbs({ metadata, objectMetadataItem });
        const isObjectPage = !isDefined(metadata.title);
        const [defaultTab, ...otherTabs] = getAvailableSettingsTabs({
          tabs: metadata.tabs ?? [],
          permissionFlagMap: availability.permissionFlagMap,
        });

        const keywords = [
          ...[
            ...(metadata.keywords ?? []),
            ...(isDefined(defaultTab) ? [defaultTab.title] : []),
          ].map((keyword) => i18n._(keyword)),
          ...(isObjectPage && isDefined(objectMetadataItem)
            ? [objectMetadataItem.labelSingular]
            : []),
        ];

        return [
          {
            id: `settings-search-${pagePath}`,
            path: pagePath,
            title,
            breadcrumbs,
            keywords,
          },
          ...otherTabs.map((tab) => ({
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
