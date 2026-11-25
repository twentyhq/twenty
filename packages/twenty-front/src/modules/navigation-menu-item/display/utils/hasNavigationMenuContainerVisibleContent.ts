import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isNavigationMenuItemBuiltInSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemBuiltInSection';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type HasNavigationMenuContainerVisibleContentArguments = {
  containerId: string;
  navigationMenuItems: NavigationMenuItem[];
  isItemReadable: (item: NavigationMenuItem) => boolean;
  isBuiltInSectionAvailable: (
    builtInSectionKey: string | null | undefined,
  ) => boolean;
};

export const hasNavigationMenuContainerVisibleContent = ({
  containerId,
  navigationMenuItems,
  isItemReadable,
  isBuiltInSectionAvailable,
}: HasNavigationMenuContainerVisibleContentArguments): boolean => {
  const childrenByParentId = new Map<string, NavigationMenuItem[]>();

  for (const item of navigationMenuItems) {
    if (isDefined(item.parentId)) {
      childrenByParentId.set(item.parentId, [
        ...(childrenByParentId.get(item.parentId) ?? []),
        item,
      ]);
    }
  }

  const isItemVisible = (item: NavigationMenuItem): boolean => {
    if (isNavigationMenuItemBuiltInSection(item)) {
      return isBuiltInSectionAvailable(item.builtInSectionKey);
    }

    if (
      item.type === NavigationMenuItemType.SECTION ||
      isNavigationMenuItemFolder(item)
    ) {
      return hasVisibleChild(item.id);
    }

    return isItemReadable(item);
  };

  const hasVisibleChild = (parentId: string): boolean =>
    (childrenByParentId.get(parentId) ?? []).some(isItemVisible);

  return hasVisibleChild(containerId);
};
