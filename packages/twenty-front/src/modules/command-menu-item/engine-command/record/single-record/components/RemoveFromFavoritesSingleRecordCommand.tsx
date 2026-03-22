import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useMountedEngineCommandContext } from '@/command-menu-item/engine-command/hooks/useMountedEngineCommandContext';
import { useDeleteNavigationMenuItem } from '@/navigation-menu-item/common/hooks/useDeleteNavigationMenuItem';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { isDefined } from 'twenty-shared/utils';

export const RemoveFromFavoritesSingleRecordCommand = () => {
  const { selectedRecords, objectMetadataItem } =
    useMountedEngineCommandContext();

  const recordId = selectedRecords[0]?.id;

  if (!isDefined(recordId) || !isDefined(objectMetadataItem)) {
    throw new Error(
      'Record ID and object metadata are required to remove from favorites',
    );
  }

  const { navigationMenuItems, workspaceNavigationMenuItems } =
    useNavigationMenuItemsData();

  const { deleteNavigationMenuItem } = useDeleteNavigationMenuItem();

  const foundNavigationMenuItem = [
    ...navigationMenuItems,
    ...workspaceNavigationMenuItems,
  ].find(
    (item) =>
      item.targetRecordId === recordId &&
      item.targetObjectMetadataId === objectMetadataItem.id,
  );

  const handleExecute = () => {
    if (!isDefined(foundNavigationMenuItem)) {
      return;
    }

    deleteNavigationMenuItem(foundNavigationMenuItem.id);
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
