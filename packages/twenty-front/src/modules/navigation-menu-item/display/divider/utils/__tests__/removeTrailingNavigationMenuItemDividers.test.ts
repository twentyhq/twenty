import { NavigationMenuItemType } from 'twenty-shared/types';

import { removeTrailingNavigationMenuItemDividers } from '@/navigation-menu-item/display/divider/utils/removeTrailingNavigationMenuItemDividers';

const view = { id: 'view', type: NavigationMenuItemType.VIEW };
const divider = { id: 'divider', type: NavigationMenuItemType.DIVIDER };
const secondDivider = { id: 'divider-2', type: NavigationMenuItemType.DIVIDER };

describe('removeTrailingNavigationMenuItemDividers', () => {
  it('removes dividers after the last other item', () => {
    expect(
      removeTrailingNavigationMenuItemDividers([view, divider, secondDivider]),
    ).toEqual([view]);
  });

  it('keeps dividers between other items', () => {
    expect(
      removeTrailingNavigationMenuItemDividers([view, divider, view]),
    ).toEqual([view, divider, view]);
  });

  it('removes all items when there are only dividers', () => {
    expect(removeTrailingNavigationMenuItemDividers([divider])).toEqual([]);
  });
});
