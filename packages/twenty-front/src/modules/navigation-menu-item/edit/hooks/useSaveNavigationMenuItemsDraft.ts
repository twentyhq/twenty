import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useMutation } from '@apollo/client/react';
import {
  CreateManyNavigationMenuItemsDocument,
  DeleteManyNavigationMenuItemsDocument,
  type NavigationMenuItem,
  UpdateManyNavigationMenuItemsDocument,
} from '~/generated-metadata/graphql';

import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { buildCreateNavigationMenuItemInput } from '@/navigation-menu-item/common/utils/buildCreateNavigationMenuItemInput';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterWorkspaceNavigationMenuItems';
import { buildUpdateInputsFromDraft } from '@/navigation-menu-item/edit/utils/buildUpdateInputsFromDraft';
import { getObjectMetadataColorUpdates } from '@/navigation-menu-item/edit/utils/getObjectMetadataColorUpdates';
import { partitionCreatesAndRecreates } from '@/navigation-menu-item/edit/utils/partitionCreatesAndRecreates';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useStore } from 'jotai';

export const useSaveNavigationMenuItemsDraft = () => {
  const {
    addToDraft,
    updateInDraft,
    removeFromDraft,
    replaceDraft,
    applyChanges,
  } = useMetadataStore();
  const [createManyNavigationMenuItemsMutation] = useMutation(
    CreateManyNavigationMenuItemsDocument,
  );
  const [deleteManyNavigationMenuItemsMutation] = useMutation(
    DeleteManyNavigationMenuItemsDocument,
  );
  const [updateManyNavigationMenuItemsMutation] = useMutation(
    UpdateManyNavigationMenuItemsDocument,
  );
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const store = useStore();

  const saveDraft = useCallback(async () => {
    const runWithNavigationMenuRollback = async (
      action: () => Promise<void>,
    ) => {
      const previousNavigationMenuItems = store.get(
        navigationMenuItemsSelector.atom,
      );

      try {
        await action();
      } catch (error) {
        replaceDraft(
          'navigationMenuItems',
          previousNavigationMenuItems as NavigationMenuItem[],
        );
        applyChanges();

        throw error;
      }
    };

    const draft = store.get(navigationMenuItemsDraftState.atom);
    const currentItems = store.get(navigationMenuItemsSelector.atom);

    if (!draft) {
      return;
    }

    const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);

    const syncObjectColorsFromDraft = async () => {
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
    };

    await syncObjectColorsFromDraft();

    const applyDeletesAfterLayoutChange = async () => {
      const workspaceItems = filterWorkspaceNavigationMenuItems(currentItems);
      const draftIds = new Set(draft.map((item) => item.id));
      const deleteAfterLayoutChangeIds = workspaceItems
        .filter((workspaceItem) => !draftIds.has(workspaceItem.id))
        .map((workspaceItem) => workspaceItem.id);

      if (deleteAfterLayoutChangeIds.length === 0) {
        return;
      }

      await runWithNavigationMenuRollback(async () => {
        removeFromDraft({
          key: 'navigationMenuItems',
          itemIds: deleteAfterLayoutChangeIds,
        });
        applyChanges();
        await deleteManyNavigationMenuItemsMutation({
          variables: { ids: deleteAfterLayoutChangeIds },
        });
      });
    };

    await applyDeletesAfterLayoutChange();

    const { workspaceItemsById, idsToCreate, idsToRecreate } =
      partitionCreatesAndRecreates({ draft, currentItems });

    const applyRecreateDeletes = async () => {
      const recreateIds = idsToRecreate.map((item) => item.id);

      if (recreateIds.length === 0) {
        return;
      }

      await runWithNavigationMenuRollback(async () => {
        removeFromDraft({
          key: 'navigationMenuItems',
          itemIds: recreateIds,
        });
        applyChanges();
        await deleteManyNavigationMenuItemsMutation({
          variables: { ids: recreateIds },
        });
      });
    };

    await applyRecreateDeletes();

    const applyCreates = async () => {
      const itemsToCreate = [...idsToCreate, ...idsToRecreate];
      const resolveFolderId = (draftFolderId: string): string => draftFolderId;

      const createInputs = itemsToCreate.map((draftItem) =>
        buildCreateNavigationMenuItemInput(draftItem, resolveFolderId),
      );

      if (createInputs.length === 0) {
        return;
      }

      const createResult = await createManyNavigationMenuItemsMutation({
        variables: { inputs: createInputs },
      });
      const createdItems = createResult.data?.createManyNavigationMenuItems;

      if (isDefined(createdItems) && createdItems.length > 0) {
        addToDraft({
          key: 'navigationMenuItems',
          items: createdItems as NavigationMenuItem[],
        });
        applyChanges();
      }
    };

    await applyCreates();

    const applyUpdates = async () => {
      const idsToRecreateSet = new Set(idsToRecreate.map((item) => item.id));
      const resolveFolderId = (draftFolderId: string): string => draftFolderId;

      const updateInputs = buildUpdateInputsFromDraft({
        draft,
        workspaceItemsById,
        idsToRecreateSet,
        resolveFolderId,
      });

      if (updateInputs.length === 0) {
        return;
      }

      const optimisticItems = updateInputs.map(({ id, update }) => ({
        id,
        ...update,
      })) as NavigationMenuItem[];

      await runWithNavigationMenuRollback(async () => {
        updateInDraft('navigationMenuItems', optimisticItems);
        applyChanges();
        const updateResult = await updateManyNavigationMenuItemsMutation({
          variables: { inputs: updateInputs },
        });
        const updatedItems = updateResult.data?.updateManyNavigationMenuItems;

        if (isDefined(updatedItems) && updatedItems.length > 0) {
          addToDraft({
            key: 'navigationMenuItems',
            items: updatedItems as NavigationMenuItem[],
          });
          applyChanges();
        }
      });
    };

    await applyUpdates();
  }, [
    addToDraft,
    updateInDraft,
    applyChanges,
    removeFromDraft,
    replaceDraft,
    createManyNavigationMenuItemsMutation,
    deleteManyNavigationMenuItemsMutation,
    updateManyNavigationMenuItemsMutation,
    updateOneObjectMetadataItem,
    store,
  ]);

  return { saveDraft };
};
