import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';

describe('isNavigationMenuItemFolder', () => {
  it('should return true when type is folder', () => {
    expect(isNavigationMenuItemFolder({ type: 'folder' })).toBe(true);
  });

  it('should return false for other types', () => {
    expect(isNavigationMenuItemFolder({ type: 'link' })).toBe(false);
    expect(isNavigationMenuItemFolder({ type: 'view' })).toBe(false);
    expect(isNavigationMenuItemFolder({ type: 'record' })).toBe(false);
  });

  it('should return false when type is null or undefined', () => {
    expect(isNavigationMenuItemFolder({ type: null })).toBe(false);
    expect(isNavigationMenuItemFolder({ type: undefined })).toBe(false);
    expect(isNavigationMenuItemFolder({})).toBe(false);
  });
});
