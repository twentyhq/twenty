import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import { type SettingsSearchAvailability } from '@/settings/search/types/SettingsSearchAvailability';
import { type SettingsSearchDestination } from '@/settings/search/types/SettingsSearchDestination';
import { type SettingsSearchRouteMetadata } from '@/settings/search/types/SettingsSearchRouteMetadata';
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
    .map(({ path, metadata }) => ({
      id: `settings-search-${path}`,
      path: getSettingsPath(path),
      title: i18n._(metadata.title),
      breadcrumbs: getBreadcrumbs(metadata),
      keywords: (metadata.keywords ?? []).map((keyword) => i18n._(keyword)),
    }));
};
