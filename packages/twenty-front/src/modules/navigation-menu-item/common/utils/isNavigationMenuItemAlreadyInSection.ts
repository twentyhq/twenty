import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { getNavigationMenuItemDescendantIds } from '@/navigation-menu-item/common/utils/getNavigationMenuItemDescendantIds';
import { getNavigationMenuItemSectionId } from '@/navigation-menu-item/common/utils/getNavigationMenuItemSectionId';
import { getNavigationMenuItemTargetKey } from '@/navigation-menu-item/common/utils/getNavigationMenuItemTargetKey';
import { getNavigationMenuItemsInSection } from '@/navigation-menu-item/common/utils/getNavigationMenuItemsInSection';

export const isNavigationMenuItemAlreadyInSection = ({
  items,
  itemId,
  containerId,
}: {
  items: Pick<
    NavigationMenuItem,
    | 'id'
    | 'type'
    | 'folderId'
    | 'targetObjectMetadataId'
    | 'targetRecordId'
    | 'viewId'
    | 'pageLayoutId'
  >[];
  itemId: string;
  containerId: string | null;
}): boolean => {
  const movedItemIds = new Set([
    itemId,
    ...getNavigationMenuItemDescendantIds(items, itemId),
  ]);
  const sectionTargetKeys = new Set(
    getNavigationMenuItemsInSection(
      items,
      getNavigationMenuItemSectionId(items, containerId),
    )
      .filter((sectionItem) => !movedItemIds.has(sectionItem.id))
      .map(getNavigationMenuItemTargetKey)
      .filter(isDefined),
  );

  return items
    .filter((item) => movedItemIds.has(item.id))
    .map(getNavigationMenuItemTargetKey)
    .some(
      (targetKey) => isDefined(targetKey) && sectionTargetKeys.has(targetKey),
    );
};
