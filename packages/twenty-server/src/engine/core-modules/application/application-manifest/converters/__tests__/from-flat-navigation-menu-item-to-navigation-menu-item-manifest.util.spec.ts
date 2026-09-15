import { type NavigationMenuItemManifest } from 'twenty-shared/application';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { fromFlatNavigationMenuItemToNavigationMenuItemManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-navigation-menu-item-to-navigation-menu-item-manifest.util';
import { fromNavigationMenuItemManifestToUniversalFlatNavigationMenuItem } from 'src/engine/core-modules/application/application-manifest/converters/from-navigation-menu-item-manifest-to-universal-flat-navigation-menu-item.util';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const NAVIGATION_MENU_ITEM_UID = '22222222-2222-4222-8222-222222222222';
const FOLDER_UID = '33333333-3333-4333-8333-333333333333';
const OBJECT_UID = '44444444-4444-4444-8444-444444444444';
const VIEW_UID = '55555555-5555-4555-8555-555555555555';
const PAGE_LAYOUT_UID = '66666666-6666-4666-8666-666666666666';
const NOW = '2026-09-09T10:00:00.000Z';

const NAVIGATION_MENU_ITEM_MANIFEST: Required<NavigationMenuItemManifest> = {
  universalIdentifier: NAVIGATION_MENU_ITEM_UID,
  type: NavigationMenuItemType.VIEW,
  name: 'All pets',
  icon: 'IconPaw',
  color: 'green',
  position: 12.5,
  link: 'https://example.com/pets',
  folderUniversalIdentifier: FOLDER_UID,
  viewUniversalIdentifier: VIEW_UID,
  targetObjectUniversalIdentifier: OBJECT_UID,
  pageLayoutUniversalIdentifier: PAGE_LAYOUT_UID,
};

const MINIMAL_NAVIGATION_MENU_ITEM_MANIFEST: NavigationMenuItemManifest = {
  universalIdentifier: NAVIGATION_MENU_ITEM_UID,
  type: NavigationMenuItemType.OBJECT,
  position: 7,
  targetObjectUniversalIdentifier: OBJECT_UID,
};

const forward = (navigationMenuItemManifest: NavigationMenuItemManifest) =>
  fromNavigationMenuItemManifestToUniversalFlatNavigationMenuItem({
    navigationMenuItemManifest,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  });

describe('fromFlatNavigationMenuItemToNavigationMenuItemManifest', () => {
  it('should reproduce the manifest after a forward then an inverse conversion', () => {
    expect(
      fromFlatNavigationMenuItemToNavigationMenuItemManifest({
        flatNavigationMenuItem: forward(NAVIGATION_MENU_ITEM_MANIFEST),
      }),
    ).toEqual(NAVIGATION_MENU_ITEM_MANIFEST);
  });

  it('should omit the null slots of a minimal manifest rather than emit them as null', () => {
    const navigationMenuItemManifest =
      fromFlatNavigationMenuItemToNavigationMenuItemManifest({
        flatNavigationMenuItem: forward(MINIMAL_NAVIGATION_MENU_ITEM_MANIFEST),
      });

    expect(navigationMenuItemManifest).toEqual(
      MINIMAL_NAVIGATION_MENU_ITEM_MANIFEST,
    );
    expect(Object.values(navigationMenuItemManifest)).not.toContain(null);
  });

  it('should keep a name the workspace stored as an empty string, which a folder is allowed to have', () => {
    expect(
      fromFlatNavigationMenuItemToNavigationMenuItemManifest({
        flatNavigationMenuItem: forward({
          universalIdentifier: FOLDER_UID,
          type: NavigationMenuItemType.FOLDER,
          position: 0,
          name: '',
        }),
      }).name,
    ).toBe('');
  });

  it('should reproduce the flat entity after an inverse then a forward conversion', () => {
    const flatNavigationMenuItem = forward(NAVIGATION_MENU_ITEM_MANIFEST);

    expect(
      compareTwoFlatEntity({
        fromUniversalFlatEntity: flatNavigationMenuItem,
        toUniversalFlatEntity: forward(
          fromFlatNavigationMenuItemToNavigationMenuItemManifest({
            flatNavigationMenuItem,
          }),
        ),
        metadataName: 'navigationMenuItem',
      }),
    ).toBeUndefined();
  });
});
