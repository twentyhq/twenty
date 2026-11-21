import { NavigationMenuItemType } from 'twenty-shared/types';

import { findNavigationMenuItemAncestor } from '@/navigation-menu-item/common/utils/findNavigationMenuItemAncestor';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuItemTabId = ({
  parentId,
  items,
}: {
  parentId: string | null | undefined;
  items: Pick<NavigationMenuItem, 'id' | 'type' | 'parentId'>[];
}): string | null =>
  findNavigationMenuItemAncestor({
    parentId,
    items,
    isMatch: (ancestor) => ancestor.type === NavigationMenuItemType.TAB,
  })?.id ?? null;
