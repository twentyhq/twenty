import { isNavigationMenuItemLink } from '@/navigation-menu-item/utils/isNavigationMenuItemLink';

describe('isNavigationMenuItemLink', () => {
  it('should return true only when item has non-empty link and no view/record metadata', () => {
    expect(
      isNavigationMenuItemLink({
        link: 'https://example.com',
        viewId: null,
        targetRecordId: null,
        targetObjectMetadataId: null,
      }),
    ).toBe(true);
  });

  it('should return false when link is missing, empty or only whitespace', () => {
    expect(
      isNavigationMenuItemLink({
        link: '',
        viewId: null,
        targetRecordId: null,
        targetObjectMetadataId: null,
      }),
    ).toBe(false);
    expect(
      isNavigationMenuItemLink({
        link: '   ',
        viewId: null,
        targetRecordId: null,
        targetObjectMetadataId: null,
      }),
    ).toBe(false);
    expect(
      isNavigationMenuItemLink({
        link: undefined,
        viewId: null,
        targetRecordId: null,
        targetObjectMetadataId: null,
      }),
    ).toBe(false);
  });

  it('should return false when viewId, targetRecordId or targetObjectMetadataId is defined', () => {
    expect(
      isNavigationMenuItemLink({
        link: 'https://example.com',
        viewId: 'view-1',
        targetRecordId: null,
        targetObjectMetadataId: null,
      }),
    ).toBe(false);
    expect(
      isNavigationMenuItemLink({
        link: 'https://example.com',
        viewId: null,
        targetRecordId: 'record-1',
        targetObjectMetadataId: null,
      }),
    ).toBe(false);
  });
});
