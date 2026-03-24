import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { Command } from '@/command-menu-item/display/components/Command';
import { useSelectedRecordIdOrThrow } from '@/command-menu-item/record/single-record/hooks/useSelectedRecordIdOrThrow';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useCreateManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useCreateManyNavigationMenuItems';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

export const AddToFavoritesSingleRecordCommand = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const recordId = useSelectedRecordIdOrThrow();

  const { createManyNavigationMenuItems } = useCreateManyNavigationMenuItems();
  const { navigationMenuItems, currentWorkspaceMemberId } =
    useNavigationMenuItemsData();

  const handleClick = () => {
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
        targetRecordId: recordId,
        targetObjectMetadataId: objectMetadataItem.id,
        userWorkspaceId: currentWorkspaceMemberId,
        position: maxPosition + 1,
      },
    ]);
  };

  return <Command onClick={handleClick} />;
};
