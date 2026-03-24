import { isDefined } from 'twenty-shared/utils';

import { Command } from '@/command-menu-item/display/components/Command';
import { useSelectedRecordIdOrThrow } from '@/command-menu-item/record/single-record/hooks/useSelectedRecordIdOrThrow';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useDeleteManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useDeleteManyNavigationMenuItems';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

export const RemoveFromFavoritesSingleRecordCommand = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const { navigationMenuItems, workspaceNavigationMenuItems } =
    useNavigationMenuItemsData();

  const { deleteManyNavigationMenuItems } = useDeleteManyNavigationMenuItems();

  const foundNavigationMenuItem = [
    ...navigationMenuItems,
    ...workspaceNavigationMenuItems,
  ].find(
    (item) =>
      item.targetRecordId === recordId &&
      item.targetObjectMetadataId === objectMetadataItem.id,
  );

  const handleClick = () => {
    if (!isDefined(foundNavigationMenuItem)) {
      return;
    }

    deleteManyNavigationMenuItems([foundNavigationMenuItem.id]);
  };

  return <Command onClick={handleClick} />;
};
