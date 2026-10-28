import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { getNavigationMenuItemSectionId } from '@/navigation-menu-item/common/utils/getNavigationMenuItemSectionId';
import { isNavigationMenuItemTabOrSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTabOrSection';

export const getNavigationMenuItemsInSection = <
  TNavigationMenuItem extends Pick<
    NavigationMenuItem,
    'id' | 'type' | 'folderId'
  >,
>(
  items: TNavigationMenuItem[],
  sectionId: string | null,
): TNavigationMenuItem[] =>
  items.filter(
    (item) =>
      !isNavigationMenuItemTabOrSection(item) &&
      getNavigationMenuItemSectionId(items, item.folderId ?? null) ===
        sectionId,
  );
