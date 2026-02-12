import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

import { useCreateNavigationMenuItemMutation } from '~/generated-metadata/graphql';

import { useDeleteNavigationMenuItem } from '@/navigation-menu-item/hooks/useDeleteNavigationMenuItem';
import { useUpdateNavigationMenuItem } from '@/navigation-menu-item/hooks/useUpdateNavigationMenuItem';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/utils/filterWorkspaceNavigationMenuItems';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';
import { isNavigationMenuItemLink } from '@/navigation-menu-item/utils/isNavigationMenuItemLink';
import { prefetchNavigationMenuItemsState } from '@/prefetch/states/prefetchNavigationMenuItemsState';

export const useSaveNavigationMenuItemsDraft = () => {
  const { updateNavigationMenuItem } = useUpdateNavigationMenuItem();
  const { deleteNavigationMenuItem } = useDeleteNavigationMenuItem();
  const [createNavigationMenuItemMutation] =
    useCreateNavigationMenuItemMutation({
      refetchQueries: ['FindManyNavigationMenuItems'],
    });

  const saveDraft = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const draft = snapshot
          .getLoadable(navigationMenuItemsDraftState)
          .getValue();
        const prefetch = snapshot
          .getLoadable(prefetchNavigationMenuItemsState)
          .getValue();

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

        const idsToCreateIncludingRecreated = [
          ...idsToCreate,
          ...idsToRecreate,
        ];

        for (const draftItem of idsToCreateIncludingRecreated) {
          const input: {
            position: number;
            folderId?: string | null;
            name?: string;
            link?: string;
            viewId?: string;
            targetObjectMetadataId?: string;
            targetRecordId?: string;
          } = {
            position: Math.max(0, Math.round(draftItem.position)),
          };

          if (isNavigationMenuItemFolder(draftItem)) {
            input.name = draftItem.name ?? undefined;
          } else if (isNavigationMenuItemLink(draftItem)) {
            input.name = draftItem.name ?? 'Link';
            const linkUrl = (draftItem.link ?? '').trim();
            input.link =
              linkUrl.startsWith('http://') || linkUrl.startsWith('https://')
                ? linkUrl
                : linkUrl
                  ? `https://${linkUrl}`
                  : undefined;
          } else if (isDefined(draftItem.viewId)) {
            input.viewId = draftItem.viewId;
          } else if (isDefined(draftItem.targetRecordId)) {
            input.targetRecordId = draftItem.targetRecordId;
            input.targetObjectMetadataId =
              draftItem.targetObjectMetadataId ?? undefined;
          }

          if (isDefined(draftItem.folderId)) {
            input.folderId = draftItem.folderId;
          }

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

          if (
            positionChanged ||
            folderIdChanged ||
            nameChanged ||
            linkChanged
          ) {
            const updateInput: {
              id: string;
              position?: number;
              folderId?: string | null;
              name?: string;
              link?: string | null;
            } = { id: draftItem.id };

            if (positionChanged) {
              updateInput.position = Math.max(
                0,
                Math.round(draftItem.position),
              );
            }
            if (folderIdChanged) {
              updateInput.folderId = draftItem.folderId ?? null;
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
                ? linkUrl.startsWith('http://') ||
                  linkUrl.startsWith('https://')
                  ? linkUrl
                  : `https://${linkUrl}`
                : null;
            }

            await updateNavigationMenuItem(updateInput);
          }
        }
      },
    [
      updateNavigationMenuItem,
      deleteNavigationMenuItem,
      createNavigationMenuItemMutation,
    ],
  );

  return { saveDraft };
};
