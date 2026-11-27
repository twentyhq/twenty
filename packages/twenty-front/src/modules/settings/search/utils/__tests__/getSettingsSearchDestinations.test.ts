import { createWorkspaceRouteObjects } from '@/app/routing/utils/createWorkspaceRouteObjects';
import {
  getSettingsSearchDestinations,
  type SettingsSearchAvailability,
} from '@/settings/search/utils/getSettingsSearchDestinations';
import { i18n } from '@lingui/core';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { buildRecordFromKeysWithSameValue } from '~/utils/array/buildRecordFromKeysWithSameValue';

const ALL_PERMISSIONS = buildRecordFromKeysWithSameValue(
  Object.values(PermissionFlagType),
  true,
);

const FULL_AVAILABILITY: SettingsSearchAvailability = {
  permissionFlagMap: ALL_PERMISSIONS,
  featureFlagsMap: {},
  isBillingEnabled: true,
};

const getDestinations = (availability = FULL_AVAILABILITY) =>
  getSettingsSearchDestinations({
    routeObjects: createWorkspaceRouteObjects({}),
    availability,
    i18n,
  });

const getTitles = (destinations: ReturnType<typeof getDestinations>) =>
  destinations.map((destination) => destination.title);

describe('getSettingsSearchDestinations', () => {
  it('builds destinations from the settings route definitions', () => {
    expect(getDestinations()).toContainEqual({
      id: 'settings-search-billing/limits',
      path: '/settings/billing/limits',
      title: 'Limits',
      breadcrumbs: ['Workspace', 'Billing'],
      keywords: ['Usage limits'],
    });
  });

  it('drops destinations whose route guard denies the permission', () => {
    const titles = getTitles(
      getDestinations({
        ...FULL_AVAILABILITY,
        permissionFlagMap: {
          ...ALL_PERMISSIONS,
          [PermissionFlagType.DATA_MODEL]: false,
        },
      }),
    );

    expect(titles).not.toContain('Data model');
    expect(titles).toContain('Members');
  });

  it('keeps breadcrumbs of a parent the member cannot open', () => {
    const destinations = getDestinations({
      ...FULL_AVAILABILITY,
      permissionFlagMap: {
        ...ALL_PERMISSIONS,
        [PermissionFlagType.BILLING]: false,
      },
    });

    expect(getTitles(destinations)).not.toContain('Billing');
    expect(
      destinations.find((destination) => destination.title === 'Limits')
        ?.breadcrumbs,
    ).toEqual(['Workspace', 'Billing']);
  });

  it('hides billing destinations when billing is disabled', () => {
    const titles = getTitles(
      getDestinations({ ...FULL_AVAILABILITY, isBillingEnabled: false }),
    );

    for (const title of ['Billing', 'Plans', 'Limits', 'Usage']) {
      expect(titles).not.toContain(title);
    }
  });

  it('lists the admin panel only when its routes exist', () => {
    const getAdminTitles = (isAdminPageEnabled: boolean) =>
      getTitles(
        getSettingsSearchDestinations({
          routeObjects: createWorkspaceRouteObjects({ isAdminPageEnabled }),
          availability: FULL_AVAILABILITY,
          i18n,
        }),
      );

    expect(getAdminTitles(false)).not.toContain('Admin Panel');
    expect(getAdminTitles(true)).toContain('Admin Panel');
  });

  it('skips routes excluded from search', () => {
    expect(getDestinations().map(({ path }) => path)).not.toContain(
      '/settings/objects/new',
    );
  });

  it('lists tabs as deep links under their page', () => {
    expect(getDestinations()).toContainEqual({
      id: 'settings-search-members#roles',
      path: '/settings/members#roles',
      title: 'Roles',
      breadcrumbs: ['Workspace', 'Members'],
      keywords: [],
    });
  });

  it('applies the tab permission on top of the page guard', () => {
    const paths = getDestinations({
      ...FULL_AVAILABILITY,
      permissionFlagMap: {
        ...ALL_PERMISSIONS,
        [PermissionFlagType.ROLES]: false,
      },
    }).map(({ path }) => path);

    expect(paths).toContain('/settings/members#invite');
    expect(paths).not.toContain('/settings/members#roles');
  });
});
