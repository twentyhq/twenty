import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuEditFolderPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditFolderPickerSubView';
import { CommandMenuEditLinkItemView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditLinkItemView';
import { CommandMenuEditObjectViewBase } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditObjectViewBase';
import { CommandMenuEditOrganizeActions } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOrganizeActions';
import { CommandMenuEditOwnerSection } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOwnerSection';
import { useNavigationMenuItemEditOrganizeActions } from '@/command-menu/pages/navigation-menu-item/hooks/useNavigationMenuItemEditOrganizeActions';
import { getOrganizeActionsSelectableItemIds } from '@/command-menu/pages/navigation-menu-item/utils/getOrganizeActionsSelectableItemIds';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { useSelectedNavigationMenuItemEditItem } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItem';
import { useSelectedNavigationMenuItemEditItemLabel } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItemLabel';
import { useSelectedNavigationMenuItemEditItemObjectMetadata } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItemObjectMetadata';
import { useUpdateLinkInDraft } from '@/navigation-menu-item/hooks/useUpdateLinkInDraft';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
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
  const { selectedItemLabel } = useSelectedNavigationMenuItemEditItemLabel();
  const { selectedItem } = useSelectedNavigationMenuItemEditItem();
  const { selectedItemObjectMetadata } =
    useSelectedNavigationMenuItemEditItemObjectMetadata();
  const selectedItemType = selectedItem?.itemType ?? null;

  const [isFolderPickerOpen, setIsFolderPickerOpen] = useState(false);
  const setFolderPicker = () => setIsFolderPickerOpen(true);

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
      return null;
    case NavigationMenuItemType.FOLDER:
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
    default:
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
  }
};
