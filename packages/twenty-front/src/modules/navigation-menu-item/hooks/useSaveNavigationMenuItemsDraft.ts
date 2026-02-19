import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

import {
  type CreateNavigationMenuItemInput,
  useCreateNavigationMenuItemMutation,
} from '~/generated-metadata/graphql';

import { useDeleteNavigationMenuItem } from '@/navigation-menu-item/hooks/useDeleteNavigationMenuItem';
import { useUpdateNavigationMenuItem } from '@/navigation-menu-item/hooks/useUpdateNavigationMenuItem';
import { navigationMenuItemsDraftStateV2 } from '@/navigation-menu-item/states/navigationMenuItemsDraftStateV2';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/utils/filterWorkspaceNavigationMenuItems';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';
import { isNavigationMenuItemLink } from '@/navigation-menu-item/utils/isNavigationMenuItemLink';
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

  const saveDraft = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const draft = store.get(navigationMenuItemsDraftStateV2.atom);
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
          const input: CreateNavigationMenuItemInput = {
            position: Math.max(0, Math.round(draftItem.position)),
          };

          if (isNavigationMenuItemFolder(draftItem)) {
            input.name = draftItem.name;
            input.icon = draftItem.icon;
            input.color = draftItem.color;
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
            input.targetObjectMetadataId = draftItem.targetObjectMetadataId;
          }

          if (isDefined(draftItem.folderId)) {
            input.folderId = draftItem.folderId;
          }

          if (isDefined(draftItem.color)) {
            input.color = draftItem.color;
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
          const folderIdChanged = original.folderId !== draftItem.folderId;
          const nameChanged =
            isNavigationMenuItemFolder(draftItem) ||
            (isNavigationMenuItemLink(draftItem) &&
              original.name !== draftItem.name);
          const linkChanged =
            isNavigationMenuItemLink(draftItem) &&
            original.link !== draftItem.link;
          const iconChanged =
            isNavigationMenuItemFolder(draftItem) &&
            original.icon !== draftItem.icon;
          const colorChanged = original.color !== draftItem.color;

          if (
            positionChanged ||
            folderIdChanged ||
            nameChanged ||
            linkChanged ||
            iconChanged ||
            colorChanged
          ) {
            const updateInput: {
              id: string;
              position?: number;
              folderId?: string | null;
              name?: string;
              link?: string | null;
              icon?: string | null;
              color?: string | null;
            } = { id: draftItem.id };

            if (positionChanged) {
              updateInput.position = Math.max(
                0,
                Math.round(draftItem.position),
              );
            }
            if (folderIdChanged) {
              updateInput.folderId = draftItem.folderId;
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
            if (iconChanged && isNavigationMenuItemFolder(draftItem)) {
              updateInput.icon = draftItem.icon;
            }
            if (colorChanged) {
              updateInput.color = draftItem.color;
            }

            await updateNavigationMenuItem(updateInput);
          }
        }
      },
    [
      updateNavigationMenuItem,
      deleteNavigationMenuItem,
      createNavigationMenuItemMutation,
      store,
    ],
  );

  return { saveDraft };
};
