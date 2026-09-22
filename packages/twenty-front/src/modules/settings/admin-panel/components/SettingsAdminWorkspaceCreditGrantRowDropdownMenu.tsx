import { t } from '@lingui/core/macro';
import { IconDotsVertical, IconTrash } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';

import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { Menu } from 'twenty-ui/primitives/surfaces';

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
    <DropdownMenu
      dropdownId={dropdownId}
      dropdownPlacement="right-start"
      clickableComponent={
        <LightIconButton emphasis="subtle" aria-label={t`More options`}>
          <IconDotsVertical />
        </LightIconButton>
      }
      dropdownComponents={
        <DropdownContent>
          <Menu.Group>
            <Menu.Item
              color="danger"
              startIcon={<IconTrash />}
              onClick={() => {
                onRevoke();
                closeDropdown(dropdownId);
              }}
            >{t`Revoke`}</Menu.Item>
          </Menu.Group>
        </DropdownContent>
      }
    />
  );
};
