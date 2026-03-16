import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useSelectedRecordIdOrThrow } from '@/command-menu-item/record/single-record/hooks/useSelectedRecordIdOrThrow';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useDeleteNavigationMenuItem } from '@/navigation-menu-item/hooks/useDeleteNavigationMenuItem';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/hooks/useNavigationMenuItemsData';
import { isDefined } from 'twenty-shared/utils';

export const RemoveFromFavoritesSingleRecordCommand = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

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
