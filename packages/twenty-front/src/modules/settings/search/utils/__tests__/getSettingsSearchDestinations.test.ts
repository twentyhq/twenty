import { createWorkspaceRouteObjects } from '@/app/routing/utils/createWorkspaceRouteObjects';
import {
  getSettingsSearchDestinations,
  type SettingsSearchAvailability,
} from '@/settings/search/utils/getSettingsSearchDestinations';
import { searchSettingsDestinations } from '@/settings/search/utils/searchSettingsDestinations';
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
  objectMetadataItems: [
    { namePlural: 'people', labelPlural: 'People', labelSingular: 'Person' },
    {
      namePlural: 'companies',
      labelPlural: 'Companies',
      labelSingular: 'Company',
    },
    { namePlural: 'pets', labelPlural: 'Pets', labelSingular: 'Pet' },
  ],
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
      id: 'settings-search-/settings/billing/limits',
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
    expect(getDestinations().map(({ path }) => path)).toContain(
      '/settings/billing/limits',
    );

    const paths = getDestinations({
      ...FULL_AVAILABILITY,
      isBillingEnabled: false,
    }).map(({ path }) => path);

    expect(
      paths.filter((path) => path.startsWith('/settings/billing')),
    ).toEqual([]);
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
      id: 'settings-search-/settings/members#roles',
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

  it('folds the default tab into its page', () => {
    const destinations = getDestinations();

    expect(destinations.map(({ path }) => path)).not.toContain(
      '/settings/members#team',
    );
    expect(
      destinations.find(({ path }) => path === '/settings/members')?.keywords,
    ).toEqual(['Team']);
  });

  it('expands object pages for every object, custom ones included', () => {
    expect(getDestinations()).toEqual(
      expect.arrayContaining([
        {
          id: 'settings-search-/settings/objects/pets',
          path: '/settings/objects/pets',
          title: 'Pets',
          breadcrumbs: ['Workspace', 'Data model'],
          keywords: ['Pet'],
          objectNamePlural: 'pets',
        },
        {
          id: 'settings-search-/settings/objects/people/object-translations',
          path: '/settings/objects/people/object-translations',
          title: 'Translations',
          breadcrumbs: ['Workspace', 'Data model', 'People'],
          keywords: ['Edit translations'],
          objectNamePlural: 'people',
        },
      ]),
    );
  });

  it.each([
    ['usage limit', '/settings/billing/limits'],
    ['roles', '/settings/members#roles'],
    ['companies', '/settings/objects/companies'],
    ['people translation', '/settings/objects/people/object-translations'],
  ])('ranks the expected destination first for "%s"', (search, path) => {
    expect(
      searchSettingsDestinations({ destinations: getDestinations(), search })[0]
        ?.path,
    ).toBe(path);
  });

  it('applies the tab feature flag on top of the page guard', () => {
    const getAiTabPaths = (featureFlagsMap: Record<string, boolean>) =>
      getDestinations({ ...FULL_AVAILABILITY, featureFlagsMap })
        .map(({ path }) => path)
        .filter((path) => path.startsWith('/settings/ai#'));

    expect(getAiTabPaths({})).not.toContain('/settings/ai#mcp');
    expect(getAiTabPaths({})).toContain('/settings/ai#models');
    expect(getAiTabPaths({ IS_AI_CHAT_INBOX_ENABLED: true })).toContain(
      '/settings/ai#mcp',
    );
  });
});
