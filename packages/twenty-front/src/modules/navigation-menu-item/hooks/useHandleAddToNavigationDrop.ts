import type { DropResult, ResponderProvided } from '@hello-pangea/dnd';
import { t } from '@lingui/core/macro';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconFolder, IconLink, useIcons } from 'twenty-ui/display';

import { ADD_TO_NAV_SOURCE_DROPPABLE_ID } from '@/navigation-menu-item/constants/AddToNavSourceDroppableId';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { useAddFolderToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddFolderToNavigationMenuDraft';
import { useAddLinkToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddLinkToNavigationMenuDraft';
import { useAddObjectToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddObjectToNavigationMenuDraft';
import { useAddRecordToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddRecordToNavigationMenuDraft';
import { useAddViewToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddViewToNavigationMenuDraft';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { useOpenNavigationMenuItemInCommandMenu } from '@/navigation-menu-item/hooks/useOpenNavigationMenuItemInCommandMenu';
import { addToNavPayloadRegistryStateV2 } from '@/navigation-menu-item/states/addToNavPayloadRegistryStateV2';
import { isNavigationMenuInEditModeStateV2 } from '@/navigation-menu-item/states/isNavigationMenuInEditModeStateV2';
import { navigationMenuItemsDraftStateV2 } from '@/navigation-menu-item/states/navigationMenuItemsDraftStateV2';
import { openNavigationMenuItemFolderIdsStateV2 } from '@/navigation-menu-item/states/openNavigationMenuItemFolderIdsStateV2';
import { selectedNavigationMenuItemInEditModeStateV2 } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeStateV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { useStore } from 'jotai';
import { isWorkspaceDroppableId } from '@/navigation-menu-item/utils/isWorkspaceDroppableId';
import { validateAndExtractWorkspaceFolderId } from '@/navigation-menu-item/utils/validateAndExtractWorkspaceFolderId';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

export const useHandleAddToNavigationDrop = () => {
  const { addObjectToDraft } = useAddObjectToNavigationMenuDraft();
  const { addViewToDraft } = useAddViewToNavigationMenuDraft();
  const { addRecordToDraft } = useAddRecordToNavigationMenuDraft();
  const { addFolderToDraft } = useAddFolderToNavigationMenuDraft();
  const { addLinkToDraft } = useAddLinkToNavigationMenuDraft();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsDraftState();
  const navigationMenuItemsDraft = useRecoilValueV2(
    navigationMenuItemsDraftStateV2,
  );
  const { openNavigationMenuItemInCommandMenu } =
    useOpenNavigationMenuItemInCommandMenu();
  const { objectMetadataItems } = useObjectMetadataItems();
  const coreViews = useRecoilValue(coreViewsState);
  const { getIcon } = useIcons();
  const setSelectedNavigationMenuItemInEditMode = useSetRecoilStateV2(
    selectedNavigationMenuItemInEditModeStateV2,
  );
  const setIsNavigationMenuInEditMode = useSetRecoilStateV2(
    isNavigationMenuInEditModeStateV2,
  );
  const setOpenNavigationMenuItemFolderIds = useSetRecoilStateV2(
    openNavigationMenuItemFolderIdsStateV2,
  );

  const store = useStore();

  const handleAddToNavigationDrop = useRecoilCallback(
    () => (result: DropResult, _provided: ResponderProvided) => {
      const { source, destination, draggableId } = result;
      if (
        source.droppableId !== ADD_TO_NAV_SOURCE_DROPPABLE_ID ||
        !destination ||
        !isWorkspaceDroppableId(destination.droppableId)
      ) {
        return;
      }

      const payload =
        store.get(addToNavPayloadRegistryStateV2.atom).get(draggableId) ?? null;
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
        options: Parameters<typeof openNavigationMenuItemInCommandMenu>[0],
      ) => {
        setIsNavigationMenuInEditMode(true);
        setSelectedNavigationMenuItemInEditMode(newItemId);
        openNavigationMenuItemInCommandMenu(options);
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
          const newItemId = addObjectToDraft(
            payload.objectMetadataId,
            payload.defaultViewId,
            currentDraft,
            folderId,
            index,
          );
          const objectMetadataItem = objectMetadataItems.find(
            (item) => item.id === payload.objectMetadataId,
          );
          openEditForNewNavItem(newItemId, {
            pageTitle: objectMetadataItem?.labelPlural ?? payload.label,
            pageIcon: objectMetadataItem
              ? getIcon(objectMetadataItem.icon)
              : IconFolder,
          });
          return;
        }
        case NavigationMenuItemType.VIEW: {
          const newItemId = addViewToDraft(
            payload.viewId,
            currentDraft,
            folderId,
            index,
          );
          const views = coreViews.map(convertCoreViewToView);
          const view = views.find((v) => v.id === payload.viewId);
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
      coreViews,
      getIcon,
      navigationMenuItemsDraft,
      objectMetadataItems,
      openNavigationMenuItemInCommandMenu,
      setOpenNavigationMenuItemFolderIds,
      setIsNavigationMenuInEditMode,
      setSelectedNavigationMenuItemInEditMode,
      store,
      workspaceNavigationMenuItems,
    ],
  );

  return { handleAddToNavigationDrop };
};
