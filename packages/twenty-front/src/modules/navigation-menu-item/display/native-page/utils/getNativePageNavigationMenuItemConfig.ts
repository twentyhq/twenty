import { isNativePageKey } from 'twenty-shared/utils';

import { NATIVE_PAGE_NAVIGATION_MENU_ITEM_CONFIGS } from '@/navigation-menu-item/display/native-page/constants/NativePageNavigationMenuItemConfigs';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNativePageNavigationMenuItemConfig = (
  item: Pick<NavigationMenuItem, 'nativePageKey'>,
) =>
  isNativePageKey(item.nativePageKey)
    ? NATIVE_PAGE_NAVIGATION_MENU_ITEM_CONFIGS[item.nativePageKey]
    : undefined;
