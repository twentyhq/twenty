import { findNavigationMenuItemAncestor } from '@/navigation-menu-item/common/utils/findNavigationMenuItemAncestor';
import { isNavigationMenuItemTabOrSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTabOrSection';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuItemPlacementScopeId = ({
  parentId,
  items,
}: {
  parentId: string | null | undefined;
  items: Pick<NavigationMenuItem, 'id' | 'type' | 'parentId'>[];
}): string | null =>
  findNavigationMenuItemAncestor({
    parentId,
    items,
    isMatch: isNavigationMenuItemTabOrSection,
  })?.id ?? null;
