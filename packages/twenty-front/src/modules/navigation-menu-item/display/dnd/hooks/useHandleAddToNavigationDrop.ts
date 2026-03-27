import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconFolder, IconLink, useIcons } from 'twenty-ui/display';

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { ADD_TO_NAV_SOURCE_DROPPABLE_ID } from '@/navigation-menu-item/common/constants/AddToNavSourceDroppableId';
import { addToNavPayloadRegistryState } from '@/navigation-menu-item/common/states/addToNavPayloadRegistryState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/common/states/openNavigationMenuItemFolderIdsState';
import { canNavigationMenuItemBeDroppedIn } from '@/navigation-menu-item/common/utils/canNavigationMenuItemBeDroppedIn';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { getObjectMetadataIdsInDraft } from '@/navigation-menu-item/common/utils/getObjectMetadataIdsInDraft';
import { validateAndExtractWorkspaceFolderId } from '@/navigation-menu-item/common/utils/validateAndExtractWorkspaceFolderId';
import { useAddFolderToNavigationMenuDraft } from '@/navigation-menu-item/edit/folder/hooks/useAddFolderToNavigationMenuDraft';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemsDraftState';
import { useOpenNavigationMenuItemInSidePanel } from '@/navigation-menu-item/edit/hooks/useOpenNavigationMenuItemInSidePanel';
import { useAddLinkToNavigationMenuDraft } from '@/navigation-menu-item/edit/link/hooks/useAddLinkToNavigationMenuDraft';
import { useAddObjectToNavigationMenuDraft } from '@/navigation-menu-item/edit/object/hooks/useAddObjectToNavigationMenuDraft';
import { useAddRecordToNavigationMenuDraft } from '@/navigation-menu-item/edit/record/hooks/useAddRecordToNavigationMenuDraft';
import { useAddViewToNavigationMenuDraft } from '@/navigation-menu-item/edit/view/hooks/useAddViewToNavigationMenuDraft';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

import { useStore } from 'jotai';
import { NavigationMenuItemType } from 'twenty-shared/types';

import type { NavigationMenuItemDropResult } from '@/navigation-menu-item/common/types/navigationMenuItemDropResult';

export const useHandleAddToNavigationDrop = () => {
  const store = useStore();
  const { addObjectToDraft } = useAddObjectToNavigationMenuDraft();
  const { addViewToDraft } = useAddViewToNavigationMenuDraft();
  const { addRecordToDraft } = useAddRecordToNavigationMenuDraft();
  const { addFolderToDraft } = useAddFolderToNavigationMenuDraft();
  const { addLinkToDraft } = useAddLinkToNavigationMenuDraft();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsDraftState();
  const navigationMenuItemsDraft = useAtomStateValue(
    navigationMenuItemsDraftState,
  );
  const { openNavigationMenuItemInSidePanel } =
    useOpenNavigationMenuItemInSidePanel();
  const { objectMetadataItems } = useObjectMetadataItems();
  const views = useAtomStateValue(viewsSelector);
  const { getIcon } = useIcons();
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();
  const setOpenNavigationMenuItemFolderIds = useSetAtomState(
    openNavigationMenuItemFolderIdsState,
  );

  const handleAddToNavigationDrop = useCallback(
    (result: NavigationMenuItemDropResult) => {
      const { source, destination, draggableId } = result;
      if (
        source.droppableId !== ADD_TO_NAV_SOURCE_DROPPABLE_ID ||
        !destination ||
        !canNavigationMenuItemBeDroppedIn({
          navigationMenuItemSection: 'workspace',
          droppableId: destination.droppableId,
        })
      ) {
        return;
      }

      const payload =
        store.get(addToNavPayloadRegistryState.atom).get(draggableId) ?? null;
      if (!payload) {
        return;
      }

      const currentDraft = isDefined(navigationMenuItemsDraft)
        ? navigationMenuItemsDraft
        : workspaceNavigationMenuItems;
      const folderId = validateAndExtractWorkspaceFolderId(
        destination.droppableId,
      );
      const index = destination.index;

      if (payload.type === NavigationMenuItemType.FOLDER && folderId !== null) {
        return;
      }

      if (isDefined(folderId)) {
        setOpenNavigationMenuItemFolderIds((current) =>
          current.includes(folderId) ? current : [...current, folderId],
        );
      }

      const openEditForNewNavItem = (
        newItemId: string,
        options: Omit<
          Parameters<typeof openNavigationMenuItemInSidePanel>[0],
          'itemId'
        >,
      ) => {
        enterLayoutCustomizationMode();
        openNavigationMenuItemInSidePanel({ ...options, itemId: newItemId });
      };

      switch (payload.type) {
        case NavigationMenuItemType.FOLDER: {
          const newFolderId = addFolderToDraft(
            payload.name,
            currentDraft,
            null,
            index,
          );
          openEditForNewNavItem(newFolderId, {
            pageTitle: t`Edit folder`,
            pageIcon: IconFolder,
            focusTitleInput: true,
          });
          return;
        }
        case NavigationMenuItemType.LINK: {
          const newLinkId = addLinkToDraft(
            payload.name || t`Link label`,
            payload.link,
            currentDraft,
            folderId,
            index,
          );
          openEditForNewNavItem(newLinkId, {
            pageTitle: t`Edit link`,
            pageIcon: IconLink,
            focusTitleInput: true,
          });
          return;
        }
        case NavigationMenuItemType.OBJECT: {
          const objectMetadataIdsInWorkspace = getObjectMetadataIdsInDraft(
            currentDraft,
            views,
          );
          if (objectMetadataIdsInWorkspace.has(payload.objectMetadataId)) {
            return;
          }
          const objectMetadataItem = objectMetadataItems.find(
            (item) => item.id === payload.objectMetadataId,
          );
          const newItemId = addObjectToDraft({
            objectMetadataId: payload.objectMetadataId,
            currentDraft,
            targetFolderId: folderId,
            targetIndex: index,
            color:
              payload.iconColor ??
              (objectMetadataItem
                ? getObjectColorWithFallback(objectMetadataItem)
                : undefined),
          });
          openEditForNewNavItem(newItemId, {
            pageTitle: objectMetadataItem?.labelPlural ?? payload.label,
            pageIcon: objectMetadataItem
              ? getIcon(objectMetadataItem.icon)
              : IconFolder,
          });
          return;
        }
        case NavigationMenuItemType.VIEW: {
          const view = views.find((v) => v.id === payload.viewId);
          const viewObjectMetadataItem = view
            ? objectMetadataItems.find(
                (item) => item.id === view.objectMetadataId,
              )
            : undefined;
          const newItemId = addViewToDraft(
            payload.viewId,
            currentDraft,
            folderId,
            index,
            viewObjectMetadataItem
              ? getObjectColorWithFallback(viewObjectMetadataItem)
              : undefined,
          );
          openEditForNewNavItem(newItemId, {
            pageTitle: view?.name ?? payload.label,
            pageIcon: view ? getIcon(view.icon) : IconFolder,
          });
          return;
        }
        case NavigationMenuItemType.RECORD: {
          const newItemId = addRecordToDraft(
            {
              recordId: payload.recordId,
              objectMetadataId: payload.objectMetadataId,
              objectNameSingular: payload.objectNameSingular,
              label: payload.label,
              imageUrl: payload.imageUrl,
            },
            currentDraft,
            folderId,
            index,
          );
          if (!isDefined(newItemId)) return;
          const objectMetadataItem = objectMetadataItems.find(
            (item) => item.id === payload.objectMetadataId,
          );
          openEditForNewNavItem(newItemId, {
            pageTitle: payload.label,
            pageIcon: objectMetadataItem
              ? getIcon(objectMetadataItem.icon)
              : IconFolder,
          });
          return;
        }
      }
    },
    [
      addFolderToDraft,
      addLinkToDraft,
      addObjectToDraft,
      addRecordToDraft,
      addViewToDraft,
      views,
      getIcon,
      navigationMenuItemsDraft,
      objectMetadataItems,
      openNavigationMenuItemInSidePanel,
      setOpenNavigationMenuItemFolderIds,
      enterLayoutCustomizationMode,
      workspaceNavigationMenuItems,
      store,
    ],
  );

  return { handleAddToNavigationDrop };
};
