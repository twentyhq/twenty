import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { isValidElement, type ReactElement } from 'react';
import {
  createMemoryRouter,
  matchRoutes,
  type RouteObject,
} from 'react-router-dom';

import { getWorkspaceRouteObjectsForSurface } from '@/app/routing/utils/getWorkspaceRouteObjectsForSurface';
import {
  createAdminConsoleRouteObjects,
  createWorkspaceRouteObjects,
} from '@/app/routing/utils/createWorkspaceRouteObjects';
import {
  isWorkspaceLocationAvailableOnSurface,
  isWorkspaceLocationExpandableFromSidePanel,
} from '@/app/routing/utils/isWorkspaceLocationAvailableOnSurface';
import { SettingsProtectedRouteWrapper } from '@/settings/components/SettingsProtectedRouteWrapper';

const SETTINGS_ROOT_PATH = AppPath.SettingsCatchAll.replace('/*', '');

const getMatchedRoutePaths = (routeObjects: RouteObject[], pathname: string) =>
  (matchRoutes(routeObjects, pathname) ?? []).map(({ route }) => route.path);

describe('workspace route objects', () => {
  it('does not leak generated route IDs into the shared registry', () => {
    const collectRouteIds = (
      routes: ReturnType<typeof createWorkspaceRouteObjects>,
    ): string[] =>
      routes.flatMap((route) => [
        ...(route.id === undefined ? [] : [route.id]),
        ...collectRouteIds(route.children ?? []),
      ]);

    expect(collectRouteIds(createWorkspaceRouteObjects({}))).toEqual([]);
  });

  it('can be embedded in a data router without route id collisions', () => {
    const router = createMemoryRouter([
      { children: createWorkspaceRouteObjects({}) },
    ]);

    router.dispose();
  });

  it('shares one route definition while exposing only verified panel pages', () => {
    const routeObjects = createWorkspaceRouteObjects({});
    const mainRoutes = getWorkspaceRouteObjectsForSurface(routeObjects, 'main');
    const panelRoutes = getWorkspaceRouteObjectsForSurface(
      routeObjects,
      'side-panel',
    );

    expect(panelRoutes.map(({ path }) => path)).toEqual([
      AppPath.WorkflowCoreShowPage,
      AppPath.RecordIndexPage,
      AppPath.RecordShowPage,
      SETTINGS_ROOT_PATH,
    ]);

    expect(mainRoutes.map(({ path }) => path)).toEqual(
      expect.arrayContaining(panelRoutes.map(({ path }) => path)),
    );

    expect(panelRoutes).not.toContainEqual(
      expect.objectContaining({ path: AppPath.PageLayoutPage }),
    );
  });

  it('preserves settings guards while recursively filtering their leaves', () => {
    const routeObjects = createWorkspaceRouteObjects({});
    const mainRoutes = getWorkspaceRouteObjectsForSurface(routeObjects, 'main');
    const panelRoutes = getWorkspaceRouteObjectsForSurface(
      routeObjects,
      'side-panel',
    );
    const objectSettingsMatches = matchRoutes(
      panelRoutes,
      '/settings/objects/companies',
    );
    const settingsGuardMatch = objectSettingsMatches?.find(
      ({ route }) => route.path === undefined,
    );

    expect(objectSettingsMatches).not.toBeNull();
    expect(isValidElement(settingsGuardMatch?.route.element)).toBe(true);
    expect((settingsGuardMatch?.route.element as ReactElement).type).toBe(
      SettingsProtectedRouteWrapper,
    );
    expect(matchRoutes(panelRoutes, '/settings/billing')).toBeNull();
    expect(matchRoutes(mainRoutes, '/settings/billing')).not.toBeNull();
  });

  it.each([
    '/settings/objects',
    '/settings/objects/companies',
    '/settings/objects/companies/name',
    '/settings/members#roles',
    '/settings/members/roles/role-id',
  ])('hosts the complementary settings leaf %s', (path) => {
    expect(
      isWorkspaceLocationAvailableOnSurface(
        createWorkspaceRouteObjects({}),
        'side-panel',
        path,
      ),
    ).toBe(true);
  });

  it.each([
    '/settings',
    '/settings/',
    '/settings/profile',
    '/settings/billing',
    '/settings/api-webhooks/graphql',
    '/settings/admin-panel',
    '/settings/not-a-real-page',
  ])('keeps the unsupported settings leaf %s on main', (path) => {
    expect(
      isWorkspaceLocationAvailableOnSurface(
        createWorkspaceRouteObjects({ isAdminPageEnabled: true }),
        'side-panel',
        path,
      ),
    ).toBe(false);
  });

  it.each([
    '/objects/companies?viewId=companies-view',
    '/settings/objects',
    '/settings/objects/overview',
    '/settings/members',
    '/settings/members#team',
    '/settings/members#roles',
  ])('allows the stateless panel route %s to expand', (path) => {
    expect(
      isWorkspaceLocationExpandableFromSidePanel(
        createWorkspaceRouteObjects({}),
        path,
      ),
    ).toBe(true);
  });

  it.each([
    '/object/person/record-id#timeline',
    '/settings/members#invite',
    '/settings/objects/new',
    '/settings/objects/companies',
    '/settings/objects/companies/new-field/select',
    '/settings/objects/companies/new-field/configure',
    '/settings/objects/companies/new-index',
    '/settings/objects/companies/name',
    '/settings/members/roles/create',
    '/settings/members/roles/role-id',
    '/settings/members/roles/role-id/object/object-id',
    '/settings/members/roles/role-id/add-object-permission',
  ])('keeps generic expansion off for the stateful route %s', (path) => {
    expect(
      isWorkspaceLocationExpandableFromSidePanel(
        createWorkspaceRouteObjects({}),
        path,
      ),
    ).toBe(false);
  });

  it('allows the core workflow show page to expand', () => {
    expect(
      isWorkspaceLocationExpandableFromSidePanel(
        createWorkspaceRouteObjects({}),
        '/workflow/core-workflow-id',
      ),
    ).toBe(true);
  });
});

describe('admin console route objects', () => {
  const matchedPaths = (pathname: string) =>
    getMatchedRoutePaths(createAdminConsoleRouteObjects(), pathname);

  it('serves the admin pages under settings', () => {
    expect(matchedPaths(getSettingsPath(SettingsPath.AdminPanel))).toEqual([
      SETTINGS_ROOT_PATH,
      SettingsPath.AdminPanel,
    ]);
  });

  it.each([
    '/',
    '/objects/companies',
    getSettingsPath(SettingsPath.ProfilePage),
  ])(
    'sends %s to the catch-all that redirects to the admin panel',
    (pathname) => {
      expect(matchedPaths(pathname).at(-1)).toBe(AppPath.NotFoundWildcard);
    },
  );
});

describe('workspace settings routes with an admin console', () => {
  const matchedPaths = (pathname: string) =>
    getMatchedRoutePaths(
      createWorkspaceRouteObjects({
        isAdminPageEnabled: true,
        isAdminConsoleEnabled: true,
      }),
      pathname,
    );

  it.each([
    getSettingsPath(SettingsPath.AdminPanel),
    getSettingsPath(SettingsPath.AdminPanelUserDetail, { userId: 'user-id' }),
  ])('sends %s to the admin console link', (pathname) => {
    expect(matchedPaths(pathname).at(-1)).toBe(`${SettingsPath.AdminPanel}/*`);
  });

  it('keeps the enterprise redirect', () => {
    expect(matchedPaths(getSettingsPath(SettingsPath.Enterprise)).at(-1)).toBe(
      SettingsPath.Enterprise,
    );
  });
});
