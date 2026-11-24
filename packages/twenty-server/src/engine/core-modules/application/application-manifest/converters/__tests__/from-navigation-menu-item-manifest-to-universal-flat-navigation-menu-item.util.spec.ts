import { fromNavigationMenuItemManifestToUniversalFlatNavigationMenuItem } from 'src/engine/core-modules/application/application-manifest/converters/from-navigation-menu-item-manifest-to-universal-flat-navigation-menu-item.util';
import { NavigationMenuItemType } from 'src/engine/metadata-modules/navigation-menu-item/enums/navigation-menu-item-type.enum';

describe('fromNavigationMenuItemManifestToUniversalFlatNavigationMenuItem', () => {
  const now = '2026-01-01T00:00:00.000Z';
  const applicationUniversalIdentifier = 'app-uuid-1';

  it('should convert a minimal navigation menu item manifest', () => {
    const result =
      fromNavigationMenuItemManifestToUniversalFlatNavigationMenuItem({
        navigationMenuItemManifest: {
          universalIdentifier: 'nav-uuid-1',
          type: NavigationMenuItemType.VIEW,
          position: 0,
        },
        applicationUniversalIdentifier,
        now,
      });

    expect(result.universalIdentifier).toBe('nav-uuid-1');
    expect(result.applicationUniversalIdentifier).toBe(
      applicationUniversalIdentifier,
    );
    expect(result.position).toBe(0);
    expect(result.name).toBeNull();
    expect(result.viewUniversalIdentifier).toBeNull();
    expect(result.link).toBeNull();
    expect(result.parentUniversalIdentifier).toBeNull();
    expect(result.targetObjectMetadataUniversalIdentifier).toBeNull();
    expect(result.targetRecordId).toBeNull();
    expect(result.userWorkspaceId).toBeNull();
  });

  it('should convert a fully specified navigation menu item manifest', () => {
    const result =
      fromNavigationMenuItemManifestToUniversalFlatNavigationMenuItem({
        navigationMenuItemManifest: {
          universalIdentifier: 'nav-uuid-2',
          type: NavigationMenuItemType.VIEW,
          name: 'Recipes Board',
          position: 1,
          viewUniversalIdentifier: 'view-uuid-1',
          parentUniversalIdentifier: 'nav-folder-uuid-1',
          targetObjectUniversalIdentifier: 'obj-uuid-1',
        },
        applicationUniversalIdentifier,
        now,
      });

    expect(result.name).toBe('Recipes Board');
    expect(result.position).toBe(1);
    expect(result.viewUniversalIdentifier).toBe('view-uuid-1');
    expect(result.parentUniversalIdentifier).toBe('nav-folder-uuid-1');
    expect(result.targetObjectMetadataUniversalIdentifier).toBe('obj-uuid-1');
  });

  it('should read the parent from the deprecated folderUniversalIdentifier', () => {
    const result =
      fromNavigationMenuItemManifestToUniversalFlatNavigationMenuItem({
        navigationMenuItemManifest: {
          universalIdentifier: 'nav-uuid-3',
          type: NavigationMenuItemType.LINK,
          position: 2,
          link: 'https://example.com',
          folderUniversalIdentifier: 'nav-folder-uuid-1',
        },
        applicationUniversalIdentifier,
        now,
      });

    expect(result.parentUniversalIdentifier).toBe('nav-folder-uuid-1');
  });
});
