import { isSystemPageKey } from 'twenty-shared/utils';

import { SYSTEM_PAGE_NAVIGATION_MENU_ITEM_CONFIGS } from '@/navigation-menu-item/display/system-page/constants/SystemPageNavigationMenuItemConfigs';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getSystemPageNavigationMenuItemConfig = (
  item: Pick<NavigationMenuItem, 'systemPageKey'>,
) =>
  isSystemPageKey(item.systemPageKey)
    ? SYSTEM_PAGE_NAVIGATION_MENU_ITEM_CONFIGS[item.systemPageKey]
    : undefined;
