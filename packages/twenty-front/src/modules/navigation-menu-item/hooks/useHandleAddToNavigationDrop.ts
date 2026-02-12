import type { DropResult, ResponderProvided } from '@hello-pangea/dnd';
import { t } from '@lingui/core/macro';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';
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
import { addToNavPayloadRegistryState } from '@/navigation-menu-item/states/addToNavPayloadRegistryState';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/states/openNavigationMenuItemFolderIdsState';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { isWorkspaceDroppableId } from '@/navigation-menu-item/utils/isWorkspaceDroppableId';
import { validateAndExtractWorkspaceFolderId } from '@/navigation-menu-item/utils/validateAndExtractWorkspaceFolderId';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

export const useHandleAddToNavigationDrop = () => {
  const { addObjectToDraft } = useAddObjectToNavigationMenuDraft();
  const { addViewToDraft } = useAddViewToNavigationMenuDraft();
  const { addRecordToDraft } = useAddRecordToNavigationMenuDraft();
  const { addFolderToDraft } = useAddFolderToNavigationMenuDraft();
  const { addLinkToDraft } = useAddLinkToNavigationMenuDraft();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsDraftState();
  const navigationMenuItemsDraft = useRecoilValue(
    navigationMenuItemsDraftState,
  );
  const { openNavigationMenuItemInCommandMenu } =
    useOpenNavigationMenuItemInCommandMenu();
  const { objectMetadataItems } = useObjectMetadataItems();
  const coreViews = useRecoilValue(coreViewsState);
  const { getIcon } = useIcons();
  const setSelectedNavigationMenuItemInEditMode = useSetRecoilState(
    selectedNavigationMenuItemInEditModeState,
  );
  const setIsNavigationMenuInEditMode = useSetRecoilState(
    isNavigationMenuInEditModeState,
  );
  const setOpenNavigationMenuItemFolderIds = useSetRecoilState(
    openNavigationMenuItemFolderIdsState,
  );

  const handleAddToNavigationDrop = useRecoilCallback(
    ({ snapshot }) =>
      (result: DropResult, _provided: ResponderProvided) => {
        const { source, destination, draggableId } = result;
        if (
          source.droppableId !== ADD_TO_NAV_SOURCE_DROPPABLE_ID ||
          !destination ||
          !isWorkspaceDroppableId(destination.droppableId)
        ) {
          return;
        }

        const payload =
          getSnapshotValue(snapshot, addToNavPayloadRegistryState).get(
            draggableId,
          ) ?? null;
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

        if (
          payload.type === NavigationMenuItemType.FOLDER &&
          folderId !== null
        ) {
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
      workspaceNavigationMenuItems,
    ],
  );

  return { handleAddToNavigationDrop };
};
