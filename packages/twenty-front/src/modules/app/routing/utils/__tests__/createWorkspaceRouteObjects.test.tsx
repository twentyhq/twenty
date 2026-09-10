import { AppPath } from 'twenty-shared/types';
import { isValidElement, type ReactElement } from 'react';
import { createMemoryRouter, matchRoutes } from 'react-router-dom';

import { getWorkspaceRouteObjectsForSurface } from '@/app/routing/utils/getWorkspaceRouteObjectsForSurface';
import { createWorkspaceRouteObjects } from '@/app/routing/utils/createWorkspaceRouteObjects';
import {
  isWorkspaceLocationAvailableOnSurface,
  isWorkspaceLocationExpandableFromSidePanel,
} from '@/app/routing/utils/isWorkspaceLocationAvailableOnSurface';
import { SettingsProtectedRouteWrapper } from '@/settings/components/SettingsProtectedRouteWrapper';

const SETTINGS_ROOT_PATH = AppPath.SettingsCatchAll.replace('/*', '');

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

  it('hosts the specialized workflow index on both surfaces', () => {
    const routeObjects = createWorkspaceRouteObjects({
      isWorkflowCoreIndexPageEnabled: true,
    });

    expect(
      isWorkspaceLocationAvailableOnSurface(
        routeObjects,
        'side-panel',
        '/objects/workflows',
      ),
    ).toBe(true);
    expect(
      getWorkspaceRouteObjectsForSurface(routeObjects, 'side-panel').map(
        ({ path }) => path,
      ),
    ).toContain(AppPath.WorkflowCoreIndexPage);
    expect(
      isWorkspaceLocationAvailableOnSurface(
        routeObjects,
        'side-panel',
        '/objects/companies',
      ),
    ).toBe(true);
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

  it('allows the specialized workflow index to expand', () => {
    expect(
      isWorkspaceLocationExpandableFromSidePanel(
        createWorkspaceRouteObjects({
          isWorkflowCoreIndexPageEnabled: true,
        }),
        '/objects/workflows',
      ),
    ).toBe(true);
  });
});
