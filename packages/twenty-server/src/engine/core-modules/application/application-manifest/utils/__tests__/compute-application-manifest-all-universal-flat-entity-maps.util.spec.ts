import { type Manifest } from 'twenty-shared/application';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { computeApplicationManifestAllUniversalFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/compute-application-manifest-all-universal-flat-entity-maps.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

const buildManifest = (): Manifest =>
  ({
    application: {
      universalIdentifier: 'application-uid',
      defaultRoleUniversalIdentifier: 'default-role-uid',
      displayName: 'Test Application',
      description: 'Test application description',
      packageJsonChecksum: null,
      yarnLockChecksum: null,
    },
    objects: [],
    fields: [],
    logicFunctions: [],
    frontComponents: [],
    permissionFlags: [],
    roles: [],
    skills: [],
    agents: [],
    publicAssets: [],
    views: [],
    navigationMenuItems: [
      {
        universalIdentifier: 'nav-menu-item-uid',
        type: NavigationMenuItemType.LINK,
        position: 0,
        link: 'https://twenty.com',
      },
      {
        universalIdentifier: 'nav-menu-item-uid',
        type: NavigationMenuItemType.OBJECT,
        position: 1,
        targetObjectUniversalIdentifier: 'object-uid',
      },
    ],
    pageLayouts: [],
    pageLayoutTabs: [],
    commandMenuItems: [],
  }) as Manifest;

describe('computeApplicationManifestAllUniversalFlatEntityMaps', () => {
  it('should keep the first navigation menu item when the manifest contains duplicates', () => {
    const allUniversalFlatEntityMaps =
      computeApplicationManifestAllUniversalFlatEntityMaps({
        manifest: buildManifest(),
        ownerFlatApplication: {
          universalIdentifier: 'application-uid',
        } as FlatApplication,
        now: '2026-07-08T00:00:00.000Z',
      });

    expect(
      Object.keys(
        allUniversalFlatEntityMaps.flatNavigationMenuItemMaps
          .byUniversalIdentifier,
      ),
    ).toEqual(['nav-menu-item-uid']);

    expect(
      allUniversalFlatEntityMaps.flatNavigationMenuItemMaps
        .byUniversalIdentifier['nav-menu-item-uid']?.type,
    ).toBe(NavigationMenuItemType.LINK);
  });
});
