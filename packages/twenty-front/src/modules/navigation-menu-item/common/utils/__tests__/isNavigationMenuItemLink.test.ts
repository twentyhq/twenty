import { NavigationMenuItemType } from 'twenty-shared/types';

import { isNavigationMenuItemLink } from '@/navigation-menu-item/common/utils/isNavigationMenuItemLink';

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
    expect(
      isNavigationMenuItemLink({ type: NavigationMenuItemType.OBJECT }),
    ).toBe(false);
  });
});
