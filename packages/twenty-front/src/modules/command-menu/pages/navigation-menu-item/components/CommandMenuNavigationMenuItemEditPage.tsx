import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuEditFolderPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditFolderPickerSubView';
import { CommandMenuEditLinkItemView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditLinkItemView';
import { CommandMenuEditObjectViewBase } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditObjectViewBase';
import { CommandMenuEditOrganizeActions } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOrganizeActions';
import { CommandMenuEditOwnerSection } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOwnerSection';
import { useNavigationMenuItemEditOrganizeActions } from '@/command-menu/pages/navigation-menu-item/hooks/useNavigationMenuItemEditOrganizeActions';
import { useNavigationMenuItemEditSubView } from '@/command-menu/pages/navigation-menu-item/hooks/useNavigationMenuItemEditSubView';
import { useSelectedNavigationMenuItemEditData } from '@/command-menu/pages/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditData';
import { getOrganizeActionsSelectableItemIds } from '@/command-menu/pages/navigation-menu-item/utils/getOrganizeActionsSelectableItemIds';
import { useUpdateLinkInDraft } from '@/navigation-menu-item/hooks/useUpdateLinkInDraft';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { NAVIGATION_MENU_ITEM_TYPE } from '@/navigation-menu-item/types/navigation-menu-item-type';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

const StyledCommandMenuPlaceholder = styled.p`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledCommandMenuPageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(3)};
`;

export const CommandMenuNavigationMenuItemEditPage = () => {
  const { t } = useLingui();

  const selectedNavigationMenuItemInEditMode = useRecoilValue(
    selectedNavigationMenuItemInEditModeState,
  );
  const {
    selectedItemLabel,
    selectedItem,
    selectedItemObjectMetadata,
    selectedItemType,
  } = useSelectedNavigationMenuItemEditData();

  const { editSubView, setFolderPicker, clearSubView } =
    useNavigationMenuItemEditSubView();

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

  if (!selectedNavigationMenuItemInEditMode || !selectedItemLabel) {
    return (
      <StyledCommandMenuPageContainer>
        <StyledCommandMenuPlaceholder>
          {t`Select a navigation item to edit`}
        </StyledCommandMenuPlaceholder>
      </StyledCommandMenuPageContainer>
    );
  }

  if (editSubView === 'folder-picker') {
    return <CommandMenuEditFolderPickerSubView onBack={clearSubView} />;
  }

  if (
    selectedItemType === NAVIGATION_MENU_ITEM_TYPE.VIEW &&
    !selectedItemObjectMetadata
  ) {
    return null;
  }

  if (selectedItemType === NAVIGATION_MENU_ITEM_TYPE.VIEW) {
    return (
      <CommandMenuEditObjectViewBase
        onOpenFolderPicker={setFolderPicker}
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

  if (
    isDefined(selectedItem) &&
    selectedItem.itemType === NAVIGATION_MENU_ITEM_TYPE.LINK
  ) {
    return (
      <CommandMenuEditLinkItemView
        key={selectedItem.id}
        selectedItem={selectedItem}
        onUpdateLink={(linkId, link) => updateLinkInDraft(linkId, { link })}
        onOpenFolderPicker={setFolderPicker}
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

  if (selectedItemType === NAVIGATION_MENU_ITEM_TYPE.LINK) {
    return null;
  }

  if (selectedItemType === NAVIGATION_MENU_ITEM_TYPE.FOLDER) {
    return (
      <CommandMenuList
        commandGroups={[]}
        selectableItemIds={getOrganizeActionsSelectableItemIds(false)}
      >
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
  }

  return (
    <CommandMenuList
      commandGroups={[]}
      selectableItemIds={getOrganizeActionsSelectableItemIds(true)}
    >
      <CommandMenuEditOrganizeActions
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRemove={onRemove}
        onAddBefore={onAddBefore}
        onAddAfter={onAddAfter}
        showMoveToFolder
        onMoveToFolder={setFolderPicker}
      />
    </CommandMenuList>
  );
};
