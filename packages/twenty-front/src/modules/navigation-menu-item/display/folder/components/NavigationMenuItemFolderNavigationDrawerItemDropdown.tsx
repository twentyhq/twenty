import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { getDropdownMenuItemClickHandler } from '@/ui/layout/dropdown/utils/getDropdownMenuItemClickHandler';
import { useLingui } from '@lingui/react/macro';
import {
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconTrash,
} from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';
import { ListItem } from 'twenty-ui/primitives/navigation';

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
            <ListItem
              startIcon={<IconEdit />}
              onClick={getDropdownMenuItemClickHandler(() => {
                onClose();
                onEdit();
              })}
            >
              <OverflowingTextWithTooltip text={t`Edit`} />
            </ListItem>
            <ListItem
              startIcon={<IconPlus />}
              onClick={getDropdownMenuItemClickHandler(() =>
                onAdd({ folderId, position: itemCount }),
              )}
            >
              <OverflowingTextWithTooltip text={t`Add menu item`} />
            </ListItem>
            <ListItem
              startIcon={<IconTrash />}
              onClick={getDropdownMenuItemClickHandler(() => {
                onClose();
                onDelete();
              })}
              color="danger"
            >
              <OverflowingTextWithTooltip text={t`Remove from sidebar`} />
            </ListItem>
          </DropdownMenuItemsContainer>
        </DropdownContent>
      )}
    />
  );
};
