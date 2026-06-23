import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isNavigationMenuItemSearch } from '@/navigation-menu-item/common/utils/isNavigationMenuItemSearch';

export const getLinkNavigationMenuItemComputedLink = (
  item: Pick<NavigationMenuItem, 'type' | 'link'>,
): string => {
  if (isNavigationMenuItemSearch(item)) {
    return item.link ?? '';
  }

  const linkUrl = (item.link ?? '').trim();
  if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
    return linkUrl;
  }
  return linkUrl ? `https://${linkUrl}` : '';
};
