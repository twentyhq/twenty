import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useCreateManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useCreateManyNavigationMenuItems';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

export const AddToFavoritesSingleRecordCommand = () => {
  const { objectMetadataItem, selectedRecords } =
    useHeadlessCommandContextApi();

  const selectedRecord = selectedRecords[0];

  if (!isDefined(objectMetadataItem)) {
    throw new Error('Object metadata item is required to add to favorites');
  }

  const { createManyNavigationMenuItems } = useCreateManyNavigationMenuItems();
  const { navigationMenuItems, currentWorkspaceMemberId } =
    useNavigationMenuItemsData();

  const handleExecute = () => {
    if (!isDefined(selectedRecord)) {
      return;
    }

    const relevantItems = navigationMenuItems.filter(
      (item) => !isDefined(item.folderId) && isDefined(item.userWorkspaceId),
    );

    const maxPosition = Math.max(
      ...relevantItems.map((item) => item.position),
      0,
    );

    createManyNavigationMenuItems([
      {
        id: uuidv4(),
        type: NavigationMenuItemType.RECORD,
        targetRecordId: selectedRecord.id,
        targetObjectMetadataId: objectMetadataItem.id,
        userWorkspaceId: currentWorkspaceMemberId,
        position: maxPosition + 1,
      },
    ]);
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
