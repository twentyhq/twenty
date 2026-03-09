import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconColumnInsertRight } from 'twenty-ui/display';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { type OrganizeActionsProps } from '@/side-panel/pages/navigation-menu-item/components/SidePanelEditOrganizeActions';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/hooks/useNavigationMenuItemMoveRemove';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { useWorkspaceSectionItems } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { addMenuItemInsertionContextState } from '@/navigation-menu-item/states/addMenuItemInsertionContextState';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { type AddMenuItemInsertionContext } from '@/navigation-menu-item/types/AddMenuItemInsertionContext';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { SidePanelPages } from 'twenty-shared/types';

const getAddMenuItemInsertionContext = (
  selectedItem: { id: string; folderId?: string | null },
  workspaceNavigationMenuItems: Array<{
    id: string;
    folderId?: string | null;
    userWorkspaceId?: string | null;
  }>,
  offset: 0 | 1,
): AddMenuItemInsertionContext | null => {
  const targetFolderId = selectedItem.folderId ?? null;
  const itemsInFolder = workspaceNavigationMenuItems.filter(
    (item) =>
      (item.folderId ?? null) === targetFolderId &&
      !isDefined(item.userWorkspaceId),
  );
  const selectedIndexInFolder = itemsInFolder.findIndex(
    (item) => item.id === selectedItem.id,
  );

  if (selectedIndexInFolder < 0) {
    return null;
  }

  return {
    targetFolderId,
    targetIndex: selectedIndexInFolder + offset,
    disableDrag: true,
  };
};

export const useNavigationMenuItemEditOrganizeActions =
  (): OrganizeActionsProps => {
    const { t } = useLingui();
    const { closeSidePanelMenu } = useSidePanelMenu();
    const { navigateSidePanel } = useNavigateSidePanel();
    const selectedNavigationMenuItemInEditMode = useAtomStateValue(
      selectedNavigationMenuItemInEditModeState,
    );
    const setSelectedNavigationMenuItemInEditMode = useSetAtomState(
      selectedNavigationMenuItemInEditModeState,
    );
    const setAddMenuItemInsertionContext = useSetAtomState(
      addMenuItemInsertionContextState,
    );
    const { workspaceNavigationMenuItems } = useNavigationMenuItemsDraftState();
    const items = useWorkspaceSectionItems();
    const { moveUp, moveDown, remove } = useNavigationMenuItemMoveRemove();

    const selectedItem = selectedNavigationMenuItemInEditMode
      ? items.find((item) => item.id === selectedNavigationMenuItemInEditMode)
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
      isDefined(selectedNavigationMenuItemInEditMode);
    const canMoveDown =
      selectedIndexInSiblings >= 0 &&
      selectedIndexInSiblings < siblings.length - 1 &&
      selectedItem != null &&
      isDefined(selectedNavigationMenuItemInEditMode);

    const handleMoveUp = () => {
      if (canMoveUp && isDefined(selectedNavigationMenuItemInEditMode)) {
        moveUp(selectedNavigationMenuItemInEditMode);
      }
    };

    const handleMoveDown = () => {
      if (canMoveDown && isDefined(selectedNavigationMenuItemInEditMode)) {
        moveDown(selectedNavigationMenuItemInEditMode);
      }
    };

    const handleRemove = () => {
      if (isDefined(selectedNavigationMenuItemInEditMode)) {
        remove(selectedNavigationMenuItemInEditMode);
        setSelectedNavigationMenuItemInEditMode(null);
        closeSidePanelMenu();
      }
    };

    const handleAddAtOffset = (offset: 0 | 1) => {
      if (!isDefined(selectedItem)) return;
      const context = getAddMenuItemInsertionContext(
        selectedItem,
        workspaceNavigationMenuItems,
        offset,
      );
      if (!context) return;
      setAddMenuItemInsertionContext(context);
      navigateSidePanel({
        page: SidePanelPages.NavigationMenuAddItem,
        pageTitle: t`New sidebar item`,
        pageIcon: IconColumnInsertRight,
        resetNavigationStack: true,
      });
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
