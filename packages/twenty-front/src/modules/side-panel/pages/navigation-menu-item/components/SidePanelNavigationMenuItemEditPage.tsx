import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { useOpenAddItemToFolderPage } from '@/navigation-menu-item/hooks/useOpenAddItemToFolderPage';
import { useSelectedNavigationMenuItemEditItem } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItem';
import { useSelectedNavigationMenuItemEditItemLabel } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItemLabel';
import { useSelectedNavigationMenuItemEditItemObjectMetadata } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItemObjectMetadata';
import { useUpdateLinkInDraft } from '@/navigation-menu-item/hooks/useUpdateLinkInDraft';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { parseThemeColor } from '@/navigation-menu-item/utils/parseThemeColor';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { SidePanelEditColorOption } from '@/side-panel/pages/navigation-menu-item/components/SidePanelEditColorOption';
import { SidePanelEditLinkItemView } from '@/side-panel/pages/navigation-menu-item/components/SidePanelEditLinkItemView';
import { SidePanelEditObjectViewBase } from '@/side-panel/pages/navigation-menu-item/components/SidePanelEditObjectViewBase';
import { SidePanelEditOrganizeActions } from '@/side-panel/pages/navigation-menu-item/components/SidePanelEditOrganizeActions';
import { SidePanelEditOwnerSection } from '@/side-panel/pages/navigation-menu-item/components/SidePanelEditOwnerSection';
import { useNavigationMenuItemEditOrganizeActions } from '@/side-panel/pages/navigation-menu-item/hooks/useNavigationMenuItemEditOrganizeActions';
import { getOrganizeActionsSelectableItemIds } from '@/side-panel/pages/navigation-menu-item/utils/getOrganizeActionsSelectableItemIds';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ViewKey } from '@/views/types/ViewKey';
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

  const selectedNavigationMenuItemInEditMode = useAtomStateValue(
    selectedNavigationMenuItemInEditModeState,
  );
  const { selectedItemLabel } = useSelectedNavigationMenuItemEditItemLabel();
  const { selectedItem } = useSelectedNavigationMenuItemEditItem();
  const { selectedItemObjectMetadata } =
    useSelectedNavigationMenuItemEditItemObjectMetadata();
  const selectedItemType = selectedItem?.itemType ?? null;

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
      <StyledSidePanelPageContainer>
        <StyledSidePanelPlaceholder>
          {t`Select a navigation item to edit`}
        </StyledSidePanelPlaceholder>
      </StyledSidePanelPageContainer>
    );
  }

  switch (selectedItemType) {
    case NavigationMenuItemType.VIEW:
      if (!selectedItemObjectMetadata) return null;
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
          {selectedItem && (
            <SidePanelGroup heading={t`Customize`}>
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
            showMoveToFolder
            onMoveToFolder={openFolderPicker}
          />
        </SidePanelList>
      );
  }
};
