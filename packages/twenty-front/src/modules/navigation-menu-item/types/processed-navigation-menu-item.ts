import { type ViewKey } from '@/views/types/ViewKey';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { type NavigationMenuItemDisplayFields } from '@/navigation-menu-item/utils/computeNavigationMenuItemDisplayFields';
import { type NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';

export type ProcessedNavigationMenuItem = NavigationMenuItem &
  NavigationMenuItemDisplayFields & {
    viewKey?: ViewKey | null;
    itemType: NavigationMenuItemType;
  };
