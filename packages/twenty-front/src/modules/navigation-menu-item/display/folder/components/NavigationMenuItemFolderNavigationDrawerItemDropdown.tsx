import { useLingui } from '@lingui/react/macro';
import { LightIconButton, MenuItem } from 'twenty-ui/components';
import {
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconTrash,
} from 'twenty-ui/icon';

import { NavigationMenuItemMenu } from '@/navigation-menu-item/edit/components/NavigationMenuItemMenu';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';

type NavigationMenuItemFolderNavigationDrawerItemDropdownProps = {
  folderId: string;
  itemCount: number;
  onEdit: () => void;
  onDelete: () => void;
};

export const NavigationMenuItemFolderNavigationDrawerItemDropdown = ({
  folderId,
  itemCount,
  onEdit,
  onDelete,
}: NavigationMenuItemFolderNavigationDrawerItemDropdownProps) => {
  const { t } = useLingui();
  const dropdownId = `navigation-menu-item-folder-edit-${folderId}`;

  return (
    <NavigationMenuItemMenu
      section="favorite"
      dropdownId={dropdownId}
      clickableComponent={
        <LightIconButton emphasis="subtle" aria-label={t`More options`}>
          <IconDotsVertical />
        </LightIconButton>
      }
      dropdownPlacement="bottom-start"
      renderMenu={({ onClose, onAdd }) => (
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Large}>
          <DropdownMenuItemsContainer>
            <MenuItem
              LeftIcon={IconEdit}
              onClick={() => {
                onClose();
                onEdit();
              }}
              accent="default"
              text={t`Edit`}
            />
            <MenuItem
              LeftIcon={IconPlus}
              onClick={() => onAdd({ folderId, position: itemCount })}
              accent="default"
              text={t`Add menu item`}
            />
            <MenuItem
              LeftIcon={IconTrash}
              onClick={() => {
                onClose();
                onDelete();
              }}
              accent="danger"
              text={t`Remove from sidebar`}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      )}
    />
  );
};
