import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isNavigationMenuItemSearch } from '@/navigation-menu-item/common/utils/isNavigationMenuItemSearch';

export const getLinkNavigationMenuItemLabel = (
  item: Pick<NavigationMenuItem, 'type' | 'name' | 'link'>,
): string => {
  if (isNavigationMenuItemSearch(item)) {
    return item.name ?? 'Search';
  }

  const linkUrl = (item.link ?? '').trim();
  return (item.name ?? linkUrl) || 'Link';
};
