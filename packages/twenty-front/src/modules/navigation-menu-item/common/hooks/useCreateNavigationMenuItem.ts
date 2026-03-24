import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';
import {
  type CreateNavigationMenuItemInput,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';

import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { useCreateManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useCreateManyNavigationMenuItems';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const buildOptimisticNavigationMenuItem = (
  input: CreateNavigationMenuItemInput & { id: string },
): NavigationMenuItem => ({
  id: input.id,
  type: input.type,
  position: input.position ?? 0,
  userWorkspaceId: input.userWorkspaceId ?? null,
  targetRecordId: input.targetRecordId ?? null,
  targetObjectMetadataId: input.targetObjectMetadataId ?? null,
  viewId: input.viewId ?? null,
  folderId: input.folderId ?? null,
  name: input.name ?? null,
  link: input.link ?? null,
  icon: input.icon ?? null,
  color: input.color ?? null,
  applicationId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const useCreateNavigationMenuItem = () => {
  const { navigationMenuItems, currentWorkspaceMemberId } =
    useNavigationMenuItemsData();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const { addToDraft, removeFromDraft, applyChanges } =
    useUpdateMetadataStoreDraft();
  const { createManyNavigationMenuItems } = useCreateManyNavigationMenuItems();

  const createNavigationMenuItem = async (
    targetRecord: ObjectRecord,
    targetObjectNameSingular: string,
    folderId?: string,
  ) => {
    const isView = targetObjectNameSingular === 'view';
    const id = uuidv4();

    const relevantItems = folderId
      ? navigationMenuItems.filter((item) => item.folderId === folderId)
      : navigationMenuItems.filter(
          (item) =>
            !isDefined(item.folderId) && isDefined(item.userWorkspaceId),
        );

    const maxPosition = Math.max(
      ...relevantItems.map((item) => item.position),
      0,
    );

    const position = maxPosition + 1;

    const input: CreateNavigationMenuItemInput = isView
      ? {
          id,
          type: NavigationMenuItemType.VIEW,
          viewId: targetRecord.id,
          userWorkspaceId: currentWorkspaceMemberId,
          folderId,
          position,
        }
      : (() => {
          const objectMetadataItem = objectMetadataItems.find(
            (item) => item.nameSingular === targetObjectNameSingular,
          );

          if (!isDefined(objectMetadataItem)) {
            throw new Error(
              `Object metadata item not found for nameSingular: ${targetObjectNameSingular}`,
            );
          }

          return {
            id,
            type: NavigationMenuItemType.RECORD,
            targetRecordId: targetRecord.id,
            targetObjectMetadataId: objectMetadataItem.id,
            userWorkspaceId: currentWorkspaceMemberId,
            folderId,
            position,
          };
        })();

    addToDraft({
      key: 'navigationMenuItems',
      items: [buildOptimisticNavigationMenuItem({ ...input, id })],
    });
    applyChanges();

    try {
      await createManyNavigationMenuItems([input]);
    } catch (error) {
      removeFromDraft({ key: 'navigationMenuItems', itemIds: [id] });
      applyChanges();
      throw error;
    }
  };

  return { createNavigationMenuItem };
};
