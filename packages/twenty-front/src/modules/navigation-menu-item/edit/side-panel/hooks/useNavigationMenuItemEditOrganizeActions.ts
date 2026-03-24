import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { pendingInsertionNavigationMenuItemState } from '@/navigation-menu-item/common/states/pendingInsertionNavigationMenuItemState';
import { type PendingInsertionNavigationMenuItem } from '@/navigation-menu-item/common/types/PendingInsertionNavigationMenuItem';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { useNavigationMenuItemSectionItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemMoveRemove';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemsDraftState';
import { type OrganizeActionsProps } from '@/navigation-menu-item/edit/side-panel/components/SidePanelEditOrganizeActions';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const computeInsertionPosition = (
  selectedItem: { id: string; folderId?: string | null },
  workspaceNavigationMenuItems: NavigationMenuItem[],
  offset: 0 | 1,
): PendingInsertionNavigationMenuItem | null => {
  const folderId = selectedItem.folderId ?? null;
  const itemsInFolderSorted = workspaceNavigationMenuItems
    .filter(
      (item) =>
        (item.folderId ?? null) === folderId &&
        !isDefined(item.userWorkspaceId),
    )
    .sort((a, b) => a.position - b.position);
  const selectedIndexSorted = itemsInFolderSorted.findIndex(
    (item) => item.id === selectedItem.id,
  );

  if (selectedIndexSorted < 0) {
    return null;
  }

  return {
    folderId,
    position: selectedIndexSorted + offset,
  };
};

export const useNavigationMenuItemEditOrganizeActions =
  (): OrganizeActionsProps => {
    const { t } = useLingui();
    const { closeSidePanelMenu } = useSidePanelMenu();
    const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();
    const selectedNavigationMenuItemIdInEditMode = useAtomStateValue(
      selectedNavigationMenuItemIdInEditModeState,
    );
    const setSelectedNavigationMenuItemIdInEditMode = useSetAtomState(
      selectedNavigationMenuItemIdInEditModeState,
    );
    const setPendingInsertionNavigationMenuItem = useSetAtomState(
      pendingInsertionNavigationMenuItemState,
    );
    const { workspaceNavigationMenuItems } = useNavigationMenuItemsDraftState();
    const items = useNavigationMenuItemSectionItems();
    const { moveUp, moveDown, remove } = useNavigationMenuItemMoveRemove();

    const selectedItem = selectedNavigationMenuItemIdInEditMode
      ? items.find((item) => item.id === selectedNavigationMenuItemIdInEditMode)
      : undefined;

    const folderId = selectedItem?.folderId ?? null;
    const siblings = items
      .filter(
        (item) =>
          ('folderId' in item ? (item.folderId ?? null) : null) === folderId,
      )
      .sort((a, b) => a.position - b.position);
    const selectedIndexInSiblings = selectedItem
      ? siblings.findIndex((item) => item.id === selectedItem.id)
      : -1;

    const canMoveUp =
      selectedIndexInSiblings > 0 &&
      selectedItem != null &&
      isDefined(selectedNavigationMenuItemIdInEditMode);
    const canMoveDown =
      selectedIndexInSiblings >= 0 &&
      selectedIndexInSiblings < siblings.length - 1 &&
      selectedItem != null &&
      isDefined(selectedNavigationMenuItemIdInEditMode);

    const handleMoveUp = () => {
      if (canMoveUp && isDefined(selectedNavigationMenuItemIdInEditMode)) {
        moveUp(selectedNavigationMenuItemIdInEditMode);
      }
    };

    const handleMoveDown = () => {
      if (canMoveDown && isDefined(selectedNavigationMenuItemIdInEditMode)) {
        moveDown(selectedNavigationMenuItemIdInEditMode);
      }
    };

    const handleRemove = () => {
      if (isDefined(selectedNavigationMenuItemIdInEditMode)) {
        remove(selectedNavigationMenuItemIdInEditMode);
        setSelectedNavigationMenuItemIdInEditMode(null);
        closeSidePanelMenu();
      }
    };

    const handleAddAtOffset = (offset: 0 | 1) => {
      if (!isDefined(selectedItem)) return;
      const insertion = computeInsertionPosition(
        selectedItem,
        workspaceNavigationMenuItems,
        offset,
      );
      if (!insertion) return;

      const title =
        offset === 0 ? t`Add menu item before` : t`Add menu item after`;

      setPendingInsertionNavigationMenuItem(insertion);
      navigateToSidePanelSubPage(
        SidePanelSubPages.NewSidebarItemMainMenu,
        title,
      );
    };

    const handleAddBefore = () => handleAddAtOffset(0);
    const handleAddAfter = () => handleAddAtOffset(1);

    return {
      canMoveUp,
      canMoveDown,
      onMoveUp: handleMoveUp,
      onMoveDown: handleMoveDown,
      onRemove: handleRemove,
      onAddBefore: handleAddBefore,
      onAddAfter: handleAddAfter,
    };
  };
