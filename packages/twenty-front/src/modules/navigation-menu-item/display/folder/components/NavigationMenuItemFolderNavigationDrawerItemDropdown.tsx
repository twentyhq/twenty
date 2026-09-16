import { useState } from 'react';
import { navigationMenuItemEditSectionState } from '@/navigation-menu-item/common/states/navigationMenuItemEditSectionState';
import { navigationMenuItemInsertionAnchorState } from '@/navigation-menu-item/common/states/navigationMenuItemInsertionAnchorState';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/common/states/openNavigationMenuItemFolderIdsState';
import { NavigationMenuItemAddDropdownContent } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdownContent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import {
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconTrash,
} from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/primitives/input';
import { MenuItem } from 'twenty-ui/primitives/navigation';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';

type NavigationMenuItemFolderNavigationDrawerItemDropdownProps = {
  folderId: string;
  itemCount: number;
  onEdit: () => void;
  onDelete: () => void;
  closeDropdown: () => void;
};

export const NavigationMenuItemFolderNavigationDrawerItemDropdown = ({
  folderId,
  itemCount,
  onEdit,
  onDelete,
  closeDropdown,
}: NavigationMenuItemFolderNavigationDrawerItemDropdownProps) => {
  const { t } = useLingui();
  const [isAddingItem, setIsAddingItem] = useState(false);
  const dropdownId = `navigation-menu-item-folder-edit-${folderId}`;
  const navigationMenuItemInsertionAnchor = useAtomStateValue(
    navigationMenuItemInsertionAnchorState,
  );
  const setNavigationMenuItemEditSection = useSetAtomState(
    navigationMenuItemEditSectionState,
  );
  const setOpenNavigationMenuItemFolderIds = useSetAtomState(
    openNavigationMenuItemFolderIdsState,
  );
  const handleAddItem = () => {
    setNavigationMenuItemEditSection('favorite');
    setOpenNavigationMenuItemFolderIds((folderIds) =>
      folderIds.includes(folderId) ? folderIds : [...folderIds, folderId],
    );
    setIsAddingItem(true);
  };
  const handleEdit = () => {
    closeDropdown();
    onEdit();
  };

  const handleDelete = () => {
    closeDropdown();
    onDelete();
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      onClose={() => setIsAddingItem(false)}
      positionReference={
        isAddingItem &&
        navigationMenuItemInsertionAnchor?.dropdownId === dropdownId
          ? navigationMenuItemInsertionAnchor.element
          : undefined
      }
      data-select-disable
      clickableComponent={
        <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
      }
      dropdownPlacement={isAddingItem ? 'right-start' : 'bottom-start'}
      dropdownComponents={
        isAddingItem ? (
          <NavigationMenuItemAddDropdownContent
            dropdownId={dropdownId}
            folderId={folderId}
            position={itemCount}
            onClose={closeDropdown}
          />
        ) : (
          <DropdownContent widthInPixels={GenericDropdownContentWidth.Large}>
            <DropdownMenuItemsContainer>
              <MenuItem
                LeftIcon={IconEdit}
                onClick={handleEdit}
                accent="default"
                text={t`Edit`}
              />
              <MenuItem
                LeftIcon={IconPlus}
                onClick={handleAddItem}
                accent="default"
                text={t`Add menu item`}
              />
              <MenuItem
                LeftIcon={IconTrash}
                onClick={handleDelete}
                accent="danger"
                text={t`Remove from sidebar`}
              />
            </DropdownMenuItemsContainer>
          </DropdownContent>
        )
      }
    />
  );
};
