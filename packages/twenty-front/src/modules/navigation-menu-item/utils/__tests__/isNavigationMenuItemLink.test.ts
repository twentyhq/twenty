import { isNavigationMenuItemLink } from '@/navigation-menu-item/utils/isNavigationMenuItemLink';

describe('isNavigationMenuItemLink', () => {
  it('should return true when type is link', () => {
    expect(isNavigationMenuItemLink({ type: 'link' })).toBe(true);
  });

  it('should return false for other types', () => {
    expect(isNavigationMenuItemLink({ type: 'folder' })).toBe(false);
    expect(isNavigationMenuItemLink({ type: 'view' })).toBe(false);
    expect(isNavigationMenuItemLink({ type: 'record' })).toBe(false);
  });

  it('should return false when type is null or undefined', () => {
    expect(isNavigationMenuItemLink({ type: null })).toBe(false);
    expect(isNavigationMenuItemLink({ type: undefined })).toBe(false);
    expect(isNavigationMenuItemLink({})).toBe(false);
  });
});
