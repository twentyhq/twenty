import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import { type SettingsSearchAvailability } from '@/settings/search/types/SettingsSearchAvailability';
import { type SettingsSearchDestination } from '@/settings/search/types/SettingsSearchDestination';
import { type SettingsSearchRouteMetadata } from '@/settings/search/types/SettingsSearchRouteMetadata';
import { getAvailableSettingsTabs } from '@/settings/utils/getAvailableSettingsTabs';
import { collectSettingsSearchRoutes } from '@/settings/search/utils/collectSettingsSearchRoutes';
import { isSettingsSearchRouteAvailable } from '@/settings/search/utils/isSettingsSearchRouteAvailable';
import { type I18n } from '@lingui/core';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

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
    .filter((route) => isSettingsSearchRouteAvailable({ route, availability }))
    .flatMap(({ path, metadata }) => {
      const title = i18n._(metadata.title);
      const breadcrumbs = getBreadcrumbs(metadata);
      const [defaultTab, ...otherTabs] = getAvailableSettingsTabs({
        tabs: metadata.tabs ?? [],
        permissionFlagMap: availability.permissionFlagMap,
      });

      return [
        {
          id: `settings-search-${path}`,
          path: getSettingsPath(path),
          title,
          breadcrumbs,
          keywords: [
            ...(metadata.keywords ?? []),
            ...(isDefined(defaultTab) ? [defaultTab.title] : []),
          ].map((keyword) => i18n._(keyword)),
        },
        ...otherTabs.map((tab) => ({
          id: `settings-search-${path}#${tab.id}`,
          path: getSettingsPath(path, undefined, undefined, tab.id),
          title: i18n._(tab.title),
          breadcrumbs: [...breadcrumbs, title],
          keywords: [],
        })),
      ];
    });
};
