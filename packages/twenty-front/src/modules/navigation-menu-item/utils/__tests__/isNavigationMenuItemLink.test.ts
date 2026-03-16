import { NavigationMenuItemType } from 'twenty-shared/types';

import { isNavigationMenuItemLink } from '@/navigation-menu-item/utils/isNavigationMenuItemLink';

describe('isNavigationMenuItemLink', () => {
  it('should return true when type is link', () => {
    expect(
      isNavigationMenuItemLink({ type: NavigationMenuItemType.LINK }),
    ).toBe(true);
  });

  it('should return false for other types', () => {
    expect(
      isNavigationMenuItemLink({ type: NavigationMenuItemType.FOLDER }),
    ).toBe(false);
    expect(
      isNavigationMenuItemLink({ type: NavigationMenuItemType.VIEW }),
    ).toBe(false);
    expect(
      isNavigationMenuItemLink({ type: NavigationMenuItemType.RECORD }),
    ).toBe(false);
  });

  it('should return false when type is null or undefined', () => {
    expect(isNavigationMenuItemLink({ type: null })).toBe(false);
    expect(isNavigationMenuItemLink({ type: undefined })).toBe(false);
    expect(isNavigationMenuItemLink({})).toBe(false);
  });
});
