import { createSettingsRouteObjects } from '@/app/components/SettingsRoutes';
import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import { type SettingsSearchRouteHandle } from '@/settings/search/types/SettingsSearchRouteHandle';
import { isValidElement, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

const getLeafRoutes = (
  routeObjects: WorkspaceRouteObject[],
): WorkspaceRouteObject[] =>
  routeObjects.flatMap((routeObject) =>
    isDefined(routeObject.children)
      ? getLeafRoutes(routeObject.children)
      : [routeObject],
  );

const isRedirect = (element: ReactNode) =>
  isValidElement(element) &&
  typeof element.type === 'function' &&
  (element.type === Navigate || element.type.name.endsWith('Redirect'));

const getSettingsSearch = (handle: SettingsSearchRouteHandle | undefined) =>
  handle?.settingsSearch;

describe('settings search route coverage', () => {
  it('makes every static settings page searchable or explicitly excluded', () => {
    const undeclaredPaths = getLeafRoutes(
      createSettingsRouteObjects({ isAdminPageEnabled: true }),
    )
      .filter(
        ({ path, element }) =>
          isDefined(path) && !path.includes(':') && !isRedirect(element),
      )
      .filter(({ handle }) => getSettingsSearch(handle) === undefined)
      .map(({ path }) => path);

    expect(undeclaredPaths).toEqual([]);
  });
});
