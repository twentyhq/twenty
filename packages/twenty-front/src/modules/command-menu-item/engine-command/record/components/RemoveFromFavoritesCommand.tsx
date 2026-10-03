import { isDefined } from 'twenty-shared/utils';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useDeleteManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useDeleteManyNavigationMenuItems';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

export const RemoveFromFavoritesCommand = () => {
  const { selectedRecords, objectMetadataItem } =
    useHeadlessCommandContextApi();

  if (!isDefined(objectMetadataItem)) {
    throw new Error('Object metadata is required to remove from favorites');
  }

  const { navigationMenuItems, workspaceNavigationMenuItems } =
    useNavigationMenuItemsData();

  const { deleteManyNavigationMenuItems } = useDeleteManyNavigationMenuItems();

  const handleExecute = () => {
    const selectedRecordIds = new Set(selectedRecords.map(({ id }) => id));

    const navigationMenuItemIdsToDelete = [
      ...navigationMenuItems,
      ...workspaceNavigationMenuItems,
    ]
      .filter(
        (item) =>
          isDefined(item.targetRecordId) &&
          selectedRecordIds.has(item.targetRecordId) &&
          item.targetObjectMetadataId === objectMetadataItem.id,
      )
      .map(({ id }) => id);

    if (navigationMenuItemIdsToDelete.length === 0) {
      return;
    }

    deleteManyNavigationMenuItems(navigationMenuItemIdsToDelete);
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
