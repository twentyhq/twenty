import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { v4 as uuidv4 } from 'uuid';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useCreateManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useCreateManyNavigationMenuItems';
import { getNextUserFavoritePosition } from '@/navigation-menu-item/common/utils/getNextUserFavoritePosition';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

export const AddToFavoritesCommand = () => {
  const { objectMetadataItem, selectedRecords } =
    useHeadlessCommandContextApi();

  if (!isDefined(objectMetadataItem)) {
    throw new Error(
      doNotTranslate('Object metadata item is required to add to favorites'),
    );
  }

  const { createManyNavigationMenuItems } = useCreateManyNavigationMenuItems();
  const { navigationMenuItems, currentUserWorkspaceId } =
    useNavigationMenuItemsData();

  const handleExecute = () => {
    const favoriteRecordIds = new Set(
      navigationMenuItems
        .filter((item) => item.targetObjectMetadataId === objectMetadataItem.id)
        .map((item) => item.targetRecordId),
    );

    const recordsToAdd = selectedRecords.filter(
      (record) => !favoriteRecordIds.has(record.id),
    );

    const nextPosition = getNextUserFavoritePosition(navigationMenuItems);

    createManyNavigationMenuItems(
      recordsToAdd.map((record, index) => ({
        id: uuidv4(),
        type: NavigationMenuItemType.RECORD,
        targetRecordId: record.id,
        targetObjectMetadataId: objectMetadataItem.id,
        userWorkspaceId: currentUserWorkspaceId,
        position: nextPosition + index,
      })),
    );
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
