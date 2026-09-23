import { ListItem } from 'twenty-ui/primitives/navigation';
import { t } from '@lingui/core/macro';
import { IconDotsVertical, IconTrash } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

type SettingsAdminWorkspaceCreditGrantRowDropdownMenuProps = {
  creditGrantId: string;
  onRevoke: () => void;
};

export const SettingsAdminWorkspaceCreditGrantRowDropdownMenu = ({
  creditGrantId,
  onRevoke,
}: SettingsAdminWorkspaceCreditGrantRowDropdownMenuProps) => {
  const dropdownId = `settings-admin-credit-grant-row-${creditGrantId}`;

  const { closeDropdown } = useCloseDropdown();

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="right-start"
      clickableComponent={
        <LightIconButton emphasis="subtle" aria-label={t`More options`}>
          <IconDotsVertical />
        </LightIconButton>
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            <ListItem
              color="danger"
              startIcon={<IconTrash />}
              onClick={() => {
                onRevoke();
                closeDropdown(dropdownId);
              }}
            >{t`Revoke`}</ListItem>
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
