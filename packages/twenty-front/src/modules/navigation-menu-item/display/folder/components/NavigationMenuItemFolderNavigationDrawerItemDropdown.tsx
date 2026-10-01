import { useState } from 'react';
import { type NavigationMenuItemMenuMode } from '@/navigation-menu-item/edit/types/NavigationMenuItemMenuMode';
import { useLingui } from '@lingui/react/macro';
import {
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconTrash,
} from 'twenty-ui/icon';
import { Dropdown, LightIconButton } from 'twenty-ui/components';

import { NavigationMenuItemMenu } from '@/navigation-menu-item/edit/components/NavigationMenuItemMenu';

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
  const [mode, setMode] = useState<NavigationMenuItemMenuMode>({
    type: 'actions',
  });
  const dropdownId = `navigation-menu-item-folder-edit-${folderId}`;

  return (
    <NavigationMenuItemMenu
      section="favorite"
      dropdownId={dropdownId}
      trigger={
        <LightIconButton emphasis="subtle" aria-label={t`More options`}>
          <IconDotsVertical />
        </LightIconButton>
      }
      mode={mode}
      onModeChange={setMode}
      side="bottom"
      renderMenu={({ onClose, onAdd }) => (
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={<IconEdit />}
            onClick={() => {
              onClose();
              onEdit();
            }}
          >{t`Edit`}</Dropdown.ActionItem>
          <Dropdown.ActionItem
            startIcon={<IconPlus />}
            closeOnClick={false}
            onClick={() => onAdd({ folderId, position: itemCount })}
          >{t`Add menu item`}</Dropdown.ActionItem>
          <Dropdown.ActionItem
            startIcon={<IconTrash />}
            onClick={() => {
              onClose();
              onDelete();
            }}
            color="danger"
          >{t`Remove from sidebar`}</Dropdown.ActionItem>
        </Dropdown.Section>
      )}
    />
  );
};
