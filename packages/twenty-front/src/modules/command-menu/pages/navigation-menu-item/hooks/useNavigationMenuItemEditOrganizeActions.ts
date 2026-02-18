import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { type OrganizeActionsProps } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOrganizeActions';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/hooks/useNavigationMenuItemMoveRemove';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { useWorkspaceSectionItems } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { addMenuItemInsertionContextStateV2 } from '@/navigation-menu-item/states/addMenuItemInsertionContextStateV2';
import { selectedNavigationMenuItemInEditModeStateV2 } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeStateV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { type AddMenuItemInsertionContext } from '@/navigation-menu-item/types/AddMenuItemInsertionContext';

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
  };
};

export const useNavigationMenuItemEditOrganizeActions =
  (): OrganizeActionsProps => {
    const { t } = useLingui();
    const { closeCommandMenu } = useCommandMenu();
    const { navigateCommandMenu } = useNavigateCommandMenu();
    const selectedNavigationMenuItemInEditMode = useRecoilValueV2(
      selectedNavigationMenuItemInEditModeStateV2,
    );
    const setSelectedNavigationMenuItemInEditMode = useSetRecoilStateV2(
      selectedNavigationMenuItemInEditModeStateV2,
    );
    const setAddMenuItemInsertionContext = useSetRecoilStateV2(
      addMenuItemInsertionContextStateV2,
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
        closeCommandMenu();
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
      navigateCommandMenu({
        page: CommandMenuPages.NavigationMenuAddItem,
        pageTitle: t`New sidebar item`,
        pageIcon: IconPlus,
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
