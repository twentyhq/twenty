import { isDefined } from 'twenty-shared/utils';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useDeleteManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useDeleteManyNavigationMenuItems';
import { findNavigationMenuItemForRecord } from '@/navigation-menu-item/common/utils/findNavigationMenuItemForRecord';
import { getNavigationMenuItemTargetRecordId } from '@/navigation-menu-item/common/utils/getNavigationMenuItemTargetRecordId';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

export const RemoveFromFavoritesSingleRecordCommand = () => {
  const { selectedRecords, objectMetadataItem } =
    useHeadlessCommandContextApi();

  const selectedRecord = selectedRecords[0];

  if (!isDefined(selectedRecord) || !isDefined(objectMetadataItem)) {
    throw new Error(
      'Record ID and object metadata are required to remove from favorites',
    );
  }

  const { navigationMenuItems, workspaceNavigationMenuItems } =
    useNavigationMenuItemsData();

  const { deleteManyNavigationMenuItems } = useDeleteManyNavigationMenuItems();

  const foundNavigationMenuItem = findNavigationMenuItemForRecord({
    navigationMenuItems: [
      ...navigationMenuItems,
      ...workspaceNavigationMenuItems,
    ],
    recordId: selectedRecord.id,
    targetRecordId: getNavigationMenuItemTargetRecordId({
      objectNameSingular: objectMetadataItem.nameSingular,
      record: selectedRecord,
    }),
    objectMetadataId: objectMetadataItem.id,
  });

  const handleExecute = () => {
    if (!isDefined(foundNavigationMenuItem)) {
      return;
    }

    deleteManyNavigationMenuItems([foundNavigationMenuItem.id]);
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
