import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import {
  type SettingsRouteGuard,
  type SettingsSearchRoute,
} from '@/settings/search/types/SettingsSearchRoute';
import { type SettingsSearchRouteHandle } from '@/settings/search/types/SettingsSearchRouteHandle';
import { getSettingsRouteGuard } from '@/settings/search/utils/getSettingsRouteGuard';
import { isSettingsPathValue } from '@/settings/search/utils/isSettingsPathValue';
import { isDefined } from 'twenty-shared/utils';

export const collectSettingsSearchRoutes = ({
  routeObjects,
  parentGuards,
}: {
  routeObjects: WorkspaceRouteObject[];
  parentGuards: SettingsRouteGuard[];
}): SettingsSearchRoute[] =>
  routeObjects.flatMap((routeObject) => {
    const guard = getSettingsRouteGuard(routeObject);
    const guards = isDefined(guard) ? [...parentGuards, guard] : parentGuards;
    const handle: SettingsSearchRouteHandle | undefined = routeObject.handle;
    const metadata = handle?.settingsSearch;
    const path = routeObject.path;
    const childRoutes = collectSettingsSearchRoutes({
      routeObjects: routeObject.children ?? [],
      parentGuards: guards,
    });

    if (
      !isDefined(metadata) ||
      !isDefined(path) ||
      !isSettingsPathValue(path)
    ) {
      return childRoutes;
    }

    return [{ path, metadata, guards }, ...childRoutes];
  });
