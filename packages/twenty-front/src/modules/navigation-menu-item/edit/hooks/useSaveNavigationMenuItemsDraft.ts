import { useCallback } from 'react';

import { useCreateManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useCreateManyNavigationMenuItems';
import { useDeleteManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useDeleteManyNavigationMenuItems';
import { useUpdateManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useUpdateManyNavigationMenuItems';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { buildCreateNavigationMenuItemInput } from '@/navigation-menu-item/common/utils/buildCreateNavigationMenuItemInput';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterWorkspaceNavigationMenuItems';
import { buildUpdateInputsFromDraft } from '@/navigation-menu-item/edit/utils/buildUpdateInputsFromDraft';
import { getObjectMetadataColorUpdates } from '@/navigation-menu-item/edit/utils/getObjectMetadataColorUpdates';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useStore } from 'jotai';

export const useSaveNavigationMenuItemsDraft = () => {
  const { createManyNavigationMenuItems } = useCreateManyNavigationMenuItems();
  const { deleteManyNavigationMenuItems } = useDeleteManyNavigationMenuItems();
  const { updateManyNavigationMenuItems } = useUpdateManyNavigationMenuItems();
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const store = useStore();

  const saveDraft = useCallback(async () => {
    const draft = store.get(navigationMenuItemsDraftState.atom);
    const currentItems = store.get(navigationMenuItemsSelector.atom);

    if (!draft) {
      return;
    }

    const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);

    const colorUpdates = getObjectMetadataColorUpdates({
      draft,
      objectMetadataItems,
    });

    for (const { idToUpdate, color } of colorUpdates) {
      await updateOneObjectMetadataItem({
        idToUpdate,
        updatePayload: { color },
      });
    }

    const workspaceItems = filterWorkspaceNavigationMenuItems(currentItems);
    const draftIds = new Set(draft.map((item) => item.id));

    const deleteAfterLayoutChangeIds = workspaceItems
      .filter((workspaceItem) => !draftIds.has(workspaceItem.id))
      .map((workspaceItem) => workspaceItem.id);

    await deleteManyNavigationMenuItems(deleteAfterLayoutChangeIds);

    const currentIds = new Set(workspaceItems.map((item) => item.id));
    const workspaceItemsById = new Map(
      workspaceItems.map((item) => [item.id, item]),
    );

    const itemsToCreate = draft.filter((item) => !currentIds.has(item.id));

    const idsToRecreate = draft.filter((item) => {
      const original = workspaceItemsById.get(item.id);

      if (!original) {
        return false;
      }

      return (
        original.viewId !== item.viewId ||
        original.targetObjectMetadataId !== item.targetObjectMetadataId ||
        original.targetRecordId !== item.targetRecordId
      );
    });

    const recreateIds = idsToRecreate.map((item) => item.id);

    await deleteManyNavigationMenuItems(recreateIds);

    const allItemsToCreate = [...itemsToCreate, ...idsToRecreate];
    const resolveFolderId = (draftFolderId: string): string => draftFolderId;

    const createInputs = allItemsToCreate.map((draftItem) =>
      buildCreateNavigationMenuItemInput(draftItem, resolveFolderId),
    );

    await createManyNavigationMenuItems(createInputs);

    const idsToRecreateSet = new Set(recreateIds);

    const updateInputs = buildUpdateInputsFromDraft({
      draft,
      workspaceItemsById,
      idsToRecreateSet,
      resolveFolderId,
    });

    await updateManyNavigationMenuItems(updateInputs);
  }, [
    createManyNavigationMenuItems,
    deleteManyNavigationMenuItems,
    updateManyNavigationMenuItems,
    updateOneObjectMetadataItem,
    store,
  ]);

  return { saveDraft };
};
