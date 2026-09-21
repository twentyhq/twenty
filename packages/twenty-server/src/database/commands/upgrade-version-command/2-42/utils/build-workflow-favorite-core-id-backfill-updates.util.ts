import { NavigationMenuItemType } from 'src/engine/metadata-modules/navigation-menu-item/enums/navigation-menu-item-type.enum';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { isDefined } from 'twenty-shared/utils';

export const buildWorkflowFavoriteCoreIdBackfillUpdates = ({
  flatNavigationMenuItems,
  workflowObjectMetadataId,
  coreWorkflowIdByWorkspaceWorkflowId,
  now,
}: {
  flatNavigationMenuItems: FlatNavigationMenuItem[];
  workflowObjectMetadataId: string;
  coreWorkflowIdByWorkspaceWorkflowId: Map<string, string>;
  now: string;
}): FlatNavigationMenuItem[] =>
  flatNavigationMenuItems.flatMap((flatNavigationMenuItem) => {
    if (
      flatNavigationMenuItem.type !== NavigationMenuItemType.RECORD ||
      flatNavigationMenuItem.targetObjectMetadataId !==
        workflowObjectMetadataId ||
      !isDefined(flatNavigationMenuItem.targetRecordId)
    ) {
      return [];
    }

    const coreWorkflowId = coreWorkflowIdByWorkspaceWorkflowId.get(
      flatNavigationMenuItem.targetRecordId,
    );

    if (
      !isDefined(coreWorkflowId) ||
      coreWorkflowId === flatNavigationMenuItem.targetRecordId
    ) {
      return [];
    }

    return [
      {
        ...flatNavigationMenuItem,
        targetRecordId: coreWorkflowId,
        updatedAt: now,
      },
    ];
  });
