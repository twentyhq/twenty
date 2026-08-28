import { NavigationMenuItemType } from 'twenty-shared/types';

import { getNavigationMenuItemColor } from '@/navigation-menu-item/common/utils/getNavigationMenuItemColor';

describe('getNavigationMenuItemColor', () => {
  it('returns the folder own color when set', () => {
    expect(
      getNavigationMenuItemColor({
        type: NavigationMenuItemType.FOLDER,
        color: 'blue',
      }),
    ).toBe('blue');
  });

  it('returns the view own color when set', () => {
    expect(
      getNavigationMenuItemColor({
        type: NavigationMenuItemType.VIEW,
        color: 'orange',
      }),
    ).toBe('orange');
  });

  it('falls back to the object color for a view without its own color', () => {
    expect(
      getNavigationMenuItemColor(
        { type: NavigationMenuItemType.VIEW, color: null },
        { nameSingular: 'opportunity', color: 'red', isSystem: false },
      ),
    ).toBe('red');
  });

  it('uses the object color for OBJECT items regardless of any color field', () => {
    expect(
      getNavigationMenuItemColor(
        { type: NavigationMenuItemType.OBJECT, color: 'orange' },
        { nameSingular: 'opportunity', color: 'red', isSystem: false },
      ),
    ).toBe('red');
  });
});
