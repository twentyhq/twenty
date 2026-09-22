import { NavigationMenuItemType } from 'src/engine/metadata-modules/navigation-menu-item/enums/navigation-menu-item-type.enum';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { isDefined } from 'twenty-shared/utils';

export type WorkflowFavoriteCoreIdBackfillUpdate = {
  id: string;
  targetRecordId: string;
};

type WorkflowFlatNavigationMenuItem = FlatNavigationMenuItem & {
  targetRecordId: string;
};

const buildOwnerScopedKey = ({
  userWorkspaceId,
  targetRecordId,
}: {
  userWorkspaceId: string | null;
  targetRecordId: string;
}) => `${userWorkspaceId ?? 'workspace'}:${targetRecordId}`;

export const buildWorkflowFavoriteCoreIdBackfillUpdates = ({
  flatNavigationMenuItems,
  workflowObjectMetadataId,
  coreWorkflowIdByWorkspaceWorkflowId,
}: {
  flatNavigationMenuItems: FlatNavigationMenuItem[];
  workflowObjectMetadataId: string;
  coreWorkflowIdByWorkspaceWorkflowId: Map<string, string>;
}): WorkflowFavoriteCoreIdBackfillUpdate[] => {
  const workflowNavigationMenuItems = flatNavigationMenuItems.filter(
    (
      flatNavigationMenuItem,
    ): flatNavigationMenuItem is WorkflowFlatNavigationMenuItem =>
      flatNavigationMenuItem.type === NavigationMenuItemType.RECORD &&
      flatNavigationMenuItem.targetObjectMetadataId ===
        workflowObjectMetadataId &&
      isDefined(flatNavigationMenuItem.targetRecordId),
  );

  const coreWorkflowIds = new Set(coreWorkflowIdByWorkspaceWorkflowId.values());

  const takenKeys = new Set(
    workflowNavigationMenuItems
      .filter(({ targetRecordId }) => coreWorkflowIds.has(targetRecordId))
      .map(buildOwnerScopedKey),
  );

  return workflowNavigationMenuItems.flatMap((flatNavigationMenuItem) => {
    const coreWorkflowId = coreWorkflowIdByWorkspaceWorkflowId.get(
      flatNavigationMenuItem.targetRecordId,
    );

    if (!isDefined(coreWorkflowId)) {
      return [];
    }

    const targetKey = buildOwnerScopedKey({
      userWorkspaceId: flatNavigationMenuItem.userWorkspaceId,
      targetRecordId: coreWorkflowId,
    });

    if (takenKeys.has(targetKey)) {
      return [];
    }

    takenKeys.add(targetKey);

    return [{ id: flatNavigationMenuItem.id, targetRecordId: coreWorkflowId }];
  });
};
