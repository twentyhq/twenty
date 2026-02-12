import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';

describe('isNavigationMenuItemFolder', () => {
  it('should return true only when item has name and no link/view/record metadata', () => {
    expect(
      isNavigationMenuItemFolder({
        name: 'My Folder',
        link: null,
        viewId: null,
        targetRecordId: null,
        targetObjectMetadataId: null,
      }),
    ).toBe(true);
  });

  it('should return false when name is missing or when link/view/record is defined', () => {
    expect(
      isNavigationMenuItemFolder({
        name: undefined,
        link: null,
        viewId: null,
        targetRecordId: null,
        targetObjectMetadataId: null,
      }),
    ).toBe(false);
    expect(
      isNavigationMenuItemFolder({
        name: 'My Folder',
        link: 'https://example.com',
        viewId: null,
        targetRecordId: null,
        targetObjectMetadataId: null,
      }),
    ).toBe(false);
    expect(
      isNavigationMenuItemFolder({
        name: 'My Folder',
        link: null,
        viewId: 'view-1',
        targetRecordId: null,
        targetObjectMetadataId: null,
      }),
    ).toBe(false);
  });
});
