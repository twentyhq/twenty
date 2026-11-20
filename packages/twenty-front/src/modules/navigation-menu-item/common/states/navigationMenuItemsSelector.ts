import { navigationMenuItemsWithHiddenSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsWithHiddenSelector';
import { filterActiveNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterActiveNavigationMenuItems';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const navigationMenuItemsSelector = createAtomSelector<
  NavigationMenuItem[]
>({
  key: 'navigationMenuItemsSelector',
  get: ({ get }) =>
    filterActiveNavigationMenuItems(get(navigationMenuItemsWithHiddenSelector)),
});
