import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { pendingInsertionNavigationMenuItemState } from '@/navigation-menu-item/common/states/pendingInsertionNavigationMenuItemState';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemsDraftState';
import { useSelectedNavigationMenuItemEditItem } from '@/navigation-menu-item/edit/hooks/useSelectedNavigationMenuItemEditItem';

import { useSelectedNavigationMenuItemEditItemLabel } from '@/navigation-menu-item/edit/hooks/useSelectedNavigationMenuItemEditItemLabel';
import { useUpdateLinkInDraft } from '@/navigation-menu-item/edit/link/hooks/useUpdateLinkInDraft';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { parseThemeColor } from '@/navigation-menu-item/common/utils/parseThemeColor';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { SidePanelEditColorOption } from '@/navigation-menu-item/edit/side-panel/components/SidePanelEditColorOption';
import { SidePanelEditLinkItemView } from '@/navigation-menu-item/edit/side-panel/components/SidePanelEditLinkItemView';
import { SidePanelEditObjectViewBase } from '@/navigation-menu-item/edit/side-panel/components/SidePanelEditObjectViewBase';
import { SidePanelEditOrganizeActions } from '@/navigation-menu-item/edit/side-panel/components/SidePanelEditOrganizeActions';
import { SidePanelEditOwnerSection } from '@/navigation-menu-item/edit/side-panel/components/SidePanelEditOwnerSection';
import { useNavigationMenuItemEditOrganizeActions } from '@/navigation-menu-item/edit/side-panel/hooks/useNavigationMenuItemEditOrganizeActions';
import { getOrganizeActionsSelectableItemIds } from '@/navigation-menu-item/edit/side-panel/utils/getOrganizeActionsSelectableItemIds';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const ADD_ITEM_TO_FOLDER_ACTION_ID = 'add-item-to-folder';

const StyledSidePanelPlaceholder = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledSidePanelPageContainer = styled.div`
  padding: ${themeCssVariables.spacing[3]};
`;

export const SidePanelNavigationMenuItemEditPage = () => {
  const { t } = useLingui();

  const selectedNavigationMenuItemIdInEditMode = useAtomStateValue(
    selectedNavigationMenuItemIdInEditModeState,
  );
  const { selectedItemLabel } = useSelectedNavigationMenuItemEditItemLabel();
  const { selectedItem } = useSelectedNavigationMenuItemEditItem();
  const selectedItemType = selectedItem?.type ?? null;

  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();
  const openFolderPicker = () =>
    navigateToSidePanelSubPage(SidePanelSubPages.EditFolderPicker);

  const {
    canMoveUp,
    canMoveDown,
    onMoveUp,
    onMoveDown,
    onRemove,
    onAddBefore,
    onAddAfter,
  } = useNavigationMenuItemEditOrganizeActions();

  const { updateLinkInDraft } = useUpdateLinkInDraft();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsDraftState();
  const setPendingInsertionNavigationMenuItem = useSetAtomState(
    pendingInsertionNavigationMenuItemState,
  );

  const handleAddItemToFolder = () => {
    if (!selectedItem || selectedItem.type !== NavigationMenuItemType.FOLDER) {
      return;
    }
    const folderItemCount = workspaceNavigationMenuItems.filter(
      (item) => (item.folderId ?? null) === selectedItem.id,
    ).length;
    setPendingInsertionNavigationMenuItem({
      folderId: selectedItem.id,
      position: folderItemCount,
    });
    navigateToSidePanelSubPage(SidePanelSubPages.NewSidebarItemMainMenu);
  };

  if (!selectedNavigationMenuItemIdInEditMode || !selectedItemLabel) {
    return (
      <StyledSidePanelPageContainer>
        <StyledSidePanelPlaceholder>
          {t`Select a navigation item to edit`}
        </StyledSidePanelPlaceholder>
      </StyledSidePanelPageContainer>
    );
  }

  switch (selectedItemType) {
    case NavigationMenuItemType.OBJECT:
      return (
        <SidePanelEditObjectViewBase
          onOpenFolderPicker={openFolderPicker}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onRemove={onRemove}
          onAddBefore={onAddBefore}
          onAddAfter={onAddAfter}
          showColorOption={isDefined(selectedItem)}
          selectedItem={selectedItem}
        />
      );
    case NavigationMenuItemType.VIEW:
      return (
        <SidePanelEditObjectViewBase
          onOpenFolderPicker={openFolderPicker}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onRemove={onRemove}
          onAddBefore={onAddBefore}
          onAddAfter={onAddAfter}
        />
      );
    case NavigationMenuItemType.LINK:
      if (
        isDefined(selectedItem) &&
        selectedItem.type === NavigationMenuItemType.LINK
      ) {
        return (
          <SidePanelEditLinkItemView
            key={selectedItem.id}
            selectedItem={selectedItem}
            onUpdateLink={(linkId, updates) =>
              updateLinkInDraft(linkId, updates)
            }
            onOpenFolderPicker={openFolderPicker}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onRemove={onRemove}
            onAddBefore={onAddBefore}
            onAddAfter={onAddAfter}
          />
        );
      }
      return null;
    case NavigationMenuItemType.FOLDER:
      return (
        <SidePanelList
          commandGroups={[]}
          selectableItemIds={[
            ADD_ITEM_TO_FOLDER_ACTION_ID,
            ...getOrganizeActionsSelectableItemIds(false),
          ]}
        >
          {selectedItem && (
            <SidePanelGroup heading={t`Customize`}>
              <SelectableListItem
                itemId={ADD_ITEM_TO_FOLDER_ACTION_ID}
                onEnter={handleAddItemToFolder}
              >
                <CommandMenuItem
                  Icon={IconPlus}
                  label={t`Add item to folder`}
                  id={ADD_ITEM_TO_FOLDER_ACTION_ID}
                  onClick={handleAddItemToFolder}
                  hasSubMenu
                />
              </SelectableListItem>
              <SidePanelEditColorOption
                navigationMenuItemId={selectedItem.id}
                color={parseThemeColor(selectedItem.color)}
              />
            </SidePanelGroup>
          )}
          <SidePanelEditOrganizeActions
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onRemove={onRemove}
            onAddBefore={onAddBefore}
            onAddAfter={onAddAfter}
          />
          <SidePanelEditOwnerSection />
        </SidePanelList>
      );
    default:
      return (
        <SidePanelList
          commandGroups={[]}
          selectableItemIds={getOrganizeActionsSelectableItemIds(true)}
        >
          <SidePanelEditOrganizeActions
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onRemove={onRemove}
            onAddBefore={onAddBefore}
            onAddAfter={onAddAfter}
            showMoveToFolder
            onMoveToFolder={openFolderPicker}
          />
        </SidePanelList>
      );
  }
};
