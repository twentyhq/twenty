import { getSystemPageNavigationMenuItemConfig } from '@/navigation-menu-item/display/system-page/utils/getSystemPageNavigationMenuItemConfig';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getSystemPageNavigationMenuItemComputedLink = (
  item: Pick<NavigationMenuItem, 'systemPageKey'>,
): string => getSystemPageNavigationMenuItemConfig(item)?.path ?? '';
