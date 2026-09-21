import { DropdownListItem } from '@/ui/layout/dropdown/components/DropdownListItem';
import { useLingui } from '@lingui/react/macro';
import {
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconTrash,
} from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';

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
            <DropdownListItem
              startIcon={<IconEdit />}
              onClick={() => {
                onClose();
                onEdit();
              }}
            >{t`Edit`}</DropdownListItem>
            <DropdownListItem
              startIcon={<IconPlus />}
              onClick={() => onAdd({ folderId, position: itemCount })}
            >{t`Add menu item`}</DropdownListItem>
            <DropdownListItem
              startIcon={<IconTrash />}
              onClick={() => {
                onClose();
                onDelete();
              }}
              color="danger"
            >{t`Remove from sidebar`}</DropdownListItem>
          </DropdownMenuItemsContainer>
        </DropdownContent>
      )}
    />
  );
};
