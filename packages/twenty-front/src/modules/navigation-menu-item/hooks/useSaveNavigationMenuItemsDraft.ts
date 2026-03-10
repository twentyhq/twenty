import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useCreateNavigationMenuItemMutation } from '~/generated-metadata/graphql';

import { useDeleteNavigationMenuItem } from '@/navigation-menu-item/hooks/useDeleteNavigationMenuItem';
import { useUpdateNavigationMenuItem } from '@/navigation-menu-item/hooks/useUpdateNavigationMenuItem';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { buildCreateNavigationMenuItemInput } from '@/navigation-menu-item/utils/buildCreateNavigationMenuItemInput';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/utils/filterWorkspaceNavigationMenuItems';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';
import { isNavigationMenuItemLink } from '@/navigation-menu-item/utils/isNavigationMenuItemLink';
import { orderFoldersForCreation } from '@/navigation-menu-item/utils/orderFoldersForCreation';
import { prefetchNavigationMenuItemsState } from '@/prefetch/states/prefetchNavigationMenuItemsState';
import { useStore } from 'jotai';

export const useSaveNavigationMenuItemsDraft = () => {
  const { updateNavigationMenuItem } = useUpdateNavigationMenuItem();
  const { deleteNavigationMenuItem } = useDeleteNavigationMenuItem();
  const [createNavigationMenuItemMutation] =
    useCreateNavigationMenuItemMutation({
      refetchQueries: ['FindManyNavigationMenuItems'],
    });

  const store = useStore();

  const saveDraft = useCallback(async () => {
    const draft = store.get(navigationMenuItemsDraftState.atom);
    const prefetch = store.get(prefetchNavigationMenuItemsState.atom);

    if (!draft) return;

    const workspacePrefetch = filterWorkspaceNavigationMenuItems(prefetch);
    const topLevelWorkspace = workspacePrefetch.filter(
      (item) => !isDefined(item.folderId),
    );
    const draftIds = new Set(draft.map((i) => i.id));

    const topLevelToDelete = topLevelWorkspace.filter(
      (item) => !draftIds.has(item.id),
    );
    const folderIdsToDelete = new Set(
      topLevelToDelete
        .filter(isNavigationMenuItemFolder)
        .map((item) => item.id),
    );
    const folderChildrenToDelete = prefetch.filter(
      (item) =>
        isDefined(item.folderId) && folderIdsToDelete.has(item.folderId),
    );

    for (const item of folderChildrenToDelete) {
      await deleteNavigationMenuItem(item.id);
    }
    for (const item of topLevelToDelete) {
      await deleteNavigationMenuItem(item.id);
    }

    const prefetchIds = new Set(workspacePrefetch.map((i) => i.id));
    const workspacePrefetchById = new Map(
      workspacePrefetch.map((i) => [i.id, i]),
    );
    const idsToCreate = draft.filter((item) => !prefetchIds.has(item.id));
    const idsToRecreate = draft.filter((item) => {
      const original = workspacePrefetchById.get(item.id);
      if (!original) return false;
      return (
        original.viewId !== item.viewId ||
        original.targetObjectMetadataId !== item.targetObjectMetadataId ||
        original.targetRecordId !== item.targetRecordId
      );
    });

    for (const draftItem of idsToRecreate) {
      await deleteNavigationMenuItem(draftItem.id);
    }

    const itemsToCreate = [...idsToCreate, ...idsToRecreate];
    const foldersToCreate = itemsToCreate.filter(isNavigationMenuItemFolder);
    const nonFoldersToCreate = itemsToCreate.filter(
      (item) => !isNavigationMenuItemFolder(item),
    );

    const createdFolderIdByDraftId = new Map<string, string>();
    const resolveFolderId = (draftFolderId: string): string =>
      createdFolderIdByDraftId.get(draftFolderId) ?? draftFolderId;

    const orderedFolders = orderFoldersForCreation(
      foldersToCreate,
      prefetchIds,
    );
    for (const draftItem of orderedFolders) {
      const input = buildCreateNavigationMenuItemInput(
        draftItem,
        resolveFolderId,
      );
      const result = await createNavigationMenuItemMutation({
        variables: { input },
      });
      const created = result.data?.createNavigationMenuItem;
      if (isDefined(created?.id)) {
        createdFolderIdByDraftId.set(draftItem.id, created.id);
      }
    }

    for (const draftItem of nonFoldersToCreate) {
      const input = buildCreateNavigationMenuItemInput(
        draftItem,
        resolveFolderId,
      );
      await createNavigationMenuItemMutation({
        variables: { input },
      });
    }

    const idsToRecreateSet = new Set(idsToRecreate.map((i) => i.id));
    for (const draftItem of draft) {
      if (idsToRecreateSet.has(draftItem.id)) continue;

      const original = workspacePrefetchById.get(draftItem.id);
      if (!original) continue;

      const positionChanged = original.position !== draftItem.position;
      const folderIdChanged =
        (original.folderId ?? null) !== (draftItem.folderId ?? null);
      const nameChanged =
        (isNavigationMenuItemFolder(draftItem) ||
          isNavigationMenuItemLink(draftItem)) &&
        (original.name ?? null) !== (draftItem.name ?? null);
      const linkChanged =
        isNavigationMenuItemLink(draftItem) &&
        (original.link ?? null) !== (draftItem.link ?? null);
      const iconChanged =
        isNavigationMenuItemFolder(draftItem) &&
        (original.icon ?? null) !== (draftItem.icon ?? null);

      if (
        positionChanged ||
        folderIdChanged ||
        nameChanged ||
        linkChanged ||
        iconChanged
      ) {
        const updateInput: {
          id: string;
          position?: number;
          folderId?: string | null;
          name?: string;
          link?: string | null;
          icon?: string | null;
        } = { id: draftItem.id };

        if (positionChanged) {
          updateInput.position = draftItem.position;
        }
        if (folderIdChanged) {
          updateInput.folderId =
            draftItem.folderId != null
              ? resolveFolderId(draftItem.folderId)
              : null;
        }
        if (nameChanged && isNavigationMenuItemFolder(draftItem)) {
          updateInput.name = draftItem.name ?? undefined;
        }
        if (nameChanged && isNavigationMenuItemLink(draftItem)) {
          updateInput.name = draftItem.name ?? undefined;
        }
        if (linkChanged && isNavigationMenuItemLink(draftItem)) {
          const linkUrl = (draftItem.link ?? '').trim();
          updateInput.link = linkUrl
            ? linkUrl.startsWith('http://') || linkUrl.startsWith('https://')
              ? linkUrl
              : `https://${linkUrl}`
            : null;
        }
        if (iconChanged && isNavigationMenuItemFolder(draftItem)) {
          updateInput.icon = draftItem.icon ?? null;
        }

        await updateNavigationMenuItem(updateInput);
      }
    }
  }, [
    updateNavigationMenuItem,
    deleteNavigationMenuItem,
    createNavigationMenuItemMutation,
    store,
  ]);

  return { saveDraft };
};
