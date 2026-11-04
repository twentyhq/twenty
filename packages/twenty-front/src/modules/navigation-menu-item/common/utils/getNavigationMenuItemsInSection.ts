import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { getNavigationMenuItemSectionId } from '@/navigation-menu-item/common/utils/getNavigationMenuItemSectionId';
import { isNavigationMenuItemContainer } from '@/navigation-menu-item/common/utils/isNavigationMenuItemContainer';

export const getNavigationMenuItemsInSection = <
  TNavigationMenuItem extends Pick<
    NavigationMenuItem,
    'id' | 'type' | 'folderId'
  >,
>({
  items,
  sectionId,
}: {
  items: TNavigationMenuItem[];
  sectionId: string | null;
}): TNavigationMenuItem[] =>
  items.filter(
    (item) =>
      !isNavigationMenuItemContainer(item) &&
      getNavigationMenuItemSectionId({
        items,
        containerId: item.folderId ?? null,
      }) === sectionId,
  );
