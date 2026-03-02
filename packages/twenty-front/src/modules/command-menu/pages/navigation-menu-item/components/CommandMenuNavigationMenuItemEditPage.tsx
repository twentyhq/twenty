import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuEditColorOption } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditColorOption';
import { CommandMenuEditFolderPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditFolderPickerSubView';
import { CommandMenuEditLinkItemView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditLinkItemView';
import { CommandMenuEditObjectViewBase } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditObjectViewBase';
import { CommandMenuEditOrganizeActions } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOrganizeActions';
import { CommandMenuEditOwnerSection } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOwnerSection';
import { useNavigationMenuItemEditOrganizeActions } from '@/command-menu/pages/navigation-menu-item/hooks/useNavigationMenuItemEditOrganizeActions';
import { getOrganizeActionsSelectableItemIds } from '@/command-menu/pages/navigation-menu-item/utils/getOrganizeActionsSelectableItemIds';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { useOpenAddItemToFolderPage } from '@/navigation-menu-item/hooks/useOpenAddItemToFolderPage';
import { useSelectedNavigationMenuItemEditItem } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItem';
import { useSelectedNavigationMenuItemEditItemLabel } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItemLabel';
import { useSelectedNavigationMenuItemEditItemObjectMetadata } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItemObjectMetadata';
import { useUpdateLinkInDraft } from '@/navigation-menu-item/hooks/useUpdateLinkInDraft';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { parseThemeColor } from '@/navigation-menu-item/utils/parseThemeColor';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ViewKey } from '@/views/types/ViewKey';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';

const ADD_ITEM_TO_FOLDER_ACTION_ID = 'add-item-to-folder';

const StyledCommandMenuPlaceholder = styled.p`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledCommandMenuPageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(3)};
`;

export const CommandMenuNavigationMenuItemEditPage = () => {
  const { t } = useLingui();

  const selectedNavigationMenuItemInEditMode = useAtomStateValue(
    selectedNavigationMenuItemInEditModeState,
  );
  const { selectedItemLabel } = useSelectedNavigationMenuItemEditItemLabel();
  const { selectedItem } = useSelectedNavigationMenuItemEditItem();
  const { selectedItemObjectMetadata } =
    useSelectedNavigationMenuItemEditItemObjectMetadata();
  const selectedItemType = selectedItem?.itemType ?? null;

  const [isFolderPickerOpen, setIsFolderPickerOpen] = useState(false);
  const openFolderPicker = () => setIsFolderPickerOpen(true);

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
  const { openAddItemToFolderPage } = useOpenAddItemToFolderPage();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsDraftState();

  const handleAddItemToFolder = () => {
    if (
      !selectedItem ||
      selectedItem.itemType !== NavigationMenuItemType.FOLDER
    ) {
      return;
    }
    const folderItemCount = workspaceNavigationMenuItems.filter(
      (item) => (item.folderId ?? null) === selectedItem.id,
    ).length;
    openAddItemToFolderPage({
      targetFolderId: selectedItem.id,
      targetIndex: folderItemCount,
      resetNavigationStack: false,
    });
  };

  if (!selectedNavigationMenuItemInEditMode || !selectedItemLabel) {
    return (
      <StyledCommandMenuPageContainer>
        <StyledCommandMenuPlaceholder>
          {t`Select a navigation item to edit`}
        </StyledCommandMenuPlaceholder>
      </StyledCommandMenuPageContainer>
    );
  }

  if (isFolderPickerOpen) {
    return (
      <CommandMenuEditFolderPickerSubView
        onBack={() => setIsFolderPickerOpen(false)}
      />
    );
  }

  switch (selectedItemType) {
    case NavigationMenuItemType.VIEW:
      if (!selectedItemObjectMetadata) return null;
      return (
        <CommandMenuEditObjectViewBase
          onOpenFolderPicker={openFolderPicker}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onRemove={onRemove}
          onAddBefore={onAddBefore}
          onAddAfter={onAddAfter}
          showColorOption={
            selectedItem &&
            'viewKey' in selectedItem &&
            selectedItem.viewKey === ViewKey.Index
          }
        />
      );
    case NavigationMenuItemType.LINK:
      if (
        isDefined(selectedItem) &&
        selectedItem.itemType === NavigationMenuItemType.LINK
      ) {
        return (
          <CommandMenuEditLinkItemView
            key={selectedItem.id}
            selectedItem={selectedItem}
            onUpdateLink={(linkId, link) => updateLinkInDraft(linkId, { link })}
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
        <CommandMenuList
          commandGroups={[]}
          selectableItemIds={[
            ADD_ITEM_TO_FOLDER_ACTION_ID,
            ...getOrganizeActionsSelectableItemIds(false),
          ]}
        >
          {selectedItem && (
            <CommandGroup heading={t`Customize`}>
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
              <CommandMenuEditColorOption
                navigationMenuItemId={selectedItem.id}
                color={parseThemeColor(selectedItem.color)}
              />
            </CommandGroup>
          )}
          <CommandMenuEditOrganizeActions
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onRemove={onRemove}
            onAddBefore={onAddBefore}
            onAddAfter={onAddAfter}
          />
          <CommandMenuEditOwnerSection />
        </CommandMenuList>
      );
    default:
      return (
        <CommandMenuList
          commandGroups={[]}
          selectableItemIds={getOrganizeActionsSelectableItemIds(true)}
        >
          {selectedItem && (
            <CommandGroup heading={t`Customize`}>
              <CommandMenuEditColorOption
                navigationMenuItemId={selectedItem.id}
                color={parseThemeColor(selectedItem.color)}
              />
            </CommandGroup>
          )}
          <CommandMenuEditOrganizeActions
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
        </CommandMenuList>
      );
  }
};
