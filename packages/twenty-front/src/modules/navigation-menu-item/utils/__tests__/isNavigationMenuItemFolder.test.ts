import { NavigationMenuItemType } from 'twenty-shared/types';

import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';

describe('isNavigationMenuItemFolder', () => {
  it('should return true when type is folder', () => {
    expect(
      isNavigationMenuItemFolder({ type: NavigationMenuItemType.FOLDER }),
    ).toBe(true);
  });

  it('should return false for other types', () => {
    expect(
      isNavigationMenuItemFolder({ type: NavigationMenuItemType.LINK }),
    ).toBe(false);
    expect(
      isNavigationMenuItemFolder({ type: NavigationMenuItemType.VIEW }),
    ).toBe(false);
    expect(
      isNavigationMenuItemFolder({ type: NavigationMenuItemType.RECORD }),
    ).toBe(false);
  });

  it('should return false when type is null or undefined', () => {
    expect(isNavigationMenuItemFolder({ type: null })).toBe(false);
    expect(isNavigationMenuItemFolder({ type: undefined })).toBe(false);
    expect(isNavigationMenuItemFolder({})).toBe(false);
  });
});
