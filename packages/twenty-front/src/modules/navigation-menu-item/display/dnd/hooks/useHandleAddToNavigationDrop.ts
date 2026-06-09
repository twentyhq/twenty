import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined, normalizeUrl } from 'twenty-shared/utils';
import { IconFolder, IconLink, useIcons } from 'twenty-ui-deprecated/display';

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { ADD_TO_NAV_SOURCE_DROPPABLE_ID } from '@/navigation-menu-item/common/constants/AddToNavSourceDroppableId';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorFolder';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorLink';
import { addToNavPayloadRegistryState } from '@/navigation-menu-item/common/states/addToNavPayloadRegistryState';
import { navigationMenuItemEditSectionState } from '@/navigation-menu-item/common/states/navigationMenuItemEditSectionState';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/common/states/openNavigationMenuItemFolderIdsState';
import { canNavigationMenuItemBeDroppedIn } from '@/navigation-menu-item/common/utils/canNavigationMenuItemBeDroppedIn';
import { getObjectMetadataIdsInDraft } from '@/navigation-menu-item/common/utils/getObjectMetadataIdsInDraft';
import { validateAndExtractWorkspaceFolderId } from '@/navigation-menu-item/common/utils/validateAndExtractWorkspaceFolderId';
import {
  type NewNavigationMenuItemInput,
  useNavigationMenuItemEditController,
} from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useOpenNavigationMenuItemInSidePanel } from '@/navigation-menu-item/edit/hooks/useOpenNavigationMenuItemInSidePanel';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

import type { NavigationMenuItemDropResult } from '@/navigation-menu-item/common/types/navigationMenuItemDropResult';

export const useHandleAddToNavigationDrop = () => {
  const store = useStore();
  const { currentItems, createItem } = useNavigationMenuItemEditController();
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
      // Drag-to-add always targets the workspace sidebar; favorites are added
      // by click only.
      if (store.get(navigationMenuItemEditSectionState.atom) === 'favorite') {
        return;
      }

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

      // Enter customization mode first: it (re)seeds the workspace draft from
      // the live items, so creating beforehand would have the new item
      // overwritten. It also bails without enabling the mode when a dashboard
      // is mid-edit, so skip the create unless the mode is actually on —
      // otherwise the item lands in a draft that is neither shown nor saved.
      const addToWorkspaceAndOpenEdit = (
        input: NewNavigationMenuItemInput,
        position: { targetFolderId: string | null; targetIndex: number },
        openOptions: Omit<
          Parameters<typeof openNavigationMenuItemInSidePanel>[0],
          'itemId'
        >,
      ) => {
        enterLayoutCustomizationMode();
        if (!store.get(isLayoutCustomizationModeEnabledState.atom)) {
          return;
        }
        const newItemId = createItem(input, position);
        openNavigationMenuItemInSidePanel({
          ...openOptions,
          itemId: newItemId,
        });
      };

      switch (payload.type) {
        case NavigationMenuItemType.FOLDER: {
          addToWorkspaceAndOpenEdit(
            {
              type: NavigationMenuItemType.FOLDER,
              name: payload.name,
              color: DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER,
            },
            { targetFolderId: null, targetIndex: index },
            {
              pageTitle: t`Edit folder`,
              pageIcon: IconFolder,
              focusTitleInput: true,
            },
          );
          return;
        }
        case NavigationMenuItemType.LINK: {
          addToWorkspaceAndOpenEdit(
            {
              type: NavigationMenuItemType.LINK,
              name: payload.name || t`Link label`,
              link: normalizeUrl(payload.link),
              color: DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK,
            },
            { targetFolderId: folderId, targetIndex: index },
            {
              pageTitle: t`Edit link`,
              pageIcon: IconLink,
              focusTitleInput: true,
            },
          );
          return;
        }
        case NavigationMenuItemType.OBJECT: {
          if (
            getObjectMetadataIdsInDraft(currentItems).has(
              payload.objectMetadataId,
            )
          ) {
            return;
          }
          const objectMetadataItem = objectMetadataItems.find(
            (item) => item.id === payload.objectMetadataId,
          );
          addToWorkspaceAndOpenEdit(
            {
              type: NavigationMenuItemType.OBJECT,
              targetObjectMetadataId: payload.objectMetadataId,
              color:
                payload.iconColor ??
                (objectMetadataItem
                  ? getObjectColorWithFallback(objectMetadataItem)
                  : undefined),
            },
            { targetFolderId: folderId, targetIndex: index },
            {
              pageTitle: objectMetadataItem?.labelPlural ?? payload.label,
              pageIcon: objectMetadataItem
                ? getIcon(objectMetadataItem.icon)
                : IconFolder,
            },
          );
          return;
        }
        case NavigationMenuItemType.VIEW: {
          const view = views.find((v) => v.id === payload.viewId);
          const viewObjectMetadataItem = view
            ? objectMetadataItems.find(
                (item) => item.id === view.objectMetadataId,
              )
            : undefined;
          addToWorkspaceAndOpenEdit(
            {
              type: NavigationMenuItemType.VIEW,
              viewId: payload.viewId,
              color: viewObjectMetadataItem
                ? getObjectColorWithFallback(viewObjectMetadataItem)
                : undefined,
            },
            { targetFolderId: folderId, targetIndex: index },
            {
              pageTitle: view?.name ?? payload.label,
              pageIcon: view ? getIcon(view.icon) : IconFolder,
            },
          );
          return;
        }
        case NavigationMenuItemType.RECORD: {
          if (!isDefined(payload.objectMetadataId)) {
            return;
          }
          const objectMetadataItem = objectMetadataItems.find(
            (item) => item.id === payload.objectMetadataId,
          );
          addToWorkspaceAndOpenEdit(
            {
              type: NavigationMenuItemType.RECORD,
              targetObjectMetadataId: payload.objectMetadataId,
              targetRecordId: payload.recordId,
              targetRecordIdentifier: {
                id: payload.recordId,
                labelIdentifier: payload.label,
                imageIdentifier: payload.imageUrl ?? null,
              },
            },
            { targetFolderId: folderId, targetIndex: index },
            {
              pageTitle: payload.label,
              pageIcon: objectMetadataItem
                ? getIcon(objectMetadataItem.icon)
                : IconFolder,
            },
          );
          return;
        }
      }
    },
    [
      createItem,
      currentItems,
      views,
      getIcon,
      objectMetadataItems,
      openNavigationMenuItemInSidePanel,
      setOpenNavigationMenuItemFolderIds,
      enterLayoutCustomizationMode,
      store,
    ],
  );

  return { handleAddToNavigationDrop };
};
