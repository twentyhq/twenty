import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import { type SettingsSearchAvailability } from '@/settings/search/types/SettingsSearchAvailability';
import { type SettingsSearchDestination } from '@/settings/search/types/SettingsSearchDestination';
import { type SettingsSearchRoute } from '@/settings/search/types/SettingsSearchRoute';
import { type SettingsSearchRouteMetadata } from '@/settings/search/types/SettingsSearchRouteMetadata';
import { collectSettingsSearchRoutes } from '@/settings/search/utils/collectSettingsSearchRoutes';
import { isSettingsSearchRouteAvailable } from '@/settings/search/utils/isSettingsSearchRouteAvailable';
import { getAvailableSettingsTabs } from '@/settings/utils/getAvailableSettingsTabs';
import { type I18n } from '@lingui/core';
import { generatePath } from 'react-router-dom';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type SettingsSearchObject =
  SettingsSearchAvailability['objectMetadataItems'][number];

const OBJECT_PATH_PARAMETERS = [':objectNamePlural'];

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
    .filter((route) => isSettingsSearchRouteAvailable({ route, availability }))
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
          featureFlagsMap: availability.featureFlagsMap,
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
            objectNamePlural: objectMetadataItem?.namePlural,
          },
          ...otherTabs.map((tab) => ({
            id: `settings-search-${pagePath}#${tab.id}`,
            path: `${pagePath}#${tab.id}`,
            title: i18n._(tab.title),
            breadcrumbs: [...breadcrumbs, title],
            keywords: [],
            objectNamePlural: objectMetadataItem?.namePlural,
          })),
        ];
      }),
    );
};
