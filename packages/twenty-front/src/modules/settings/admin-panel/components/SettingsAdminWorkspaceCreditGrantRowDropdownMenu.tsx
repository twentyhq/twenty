import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { t } from '@lingui/core/macro';
import { IconDotsVertical, IconTrash } from 'twenty-ui/icon';
import { Dropdown, LightIconButton } from 'twenty-ui/components';

type SettingsAdminWorkspaceCreditGrantRowDropdownMenuProps = {
  creditGrantId: string;
  onRevoke: () => void;
};

export const SettingsAdminWorkspaceCreditGrantRowDropdownMenu = ({
  creditGrantId,
  onRevoke,
}: SettingsAdminWorkspaceCreditGrantRowDropdownMenuProps) => {
  const dropdownId = `settings-admin-credit-grant-row-${creditGrantId}`;
  return (
    <DropdownRoot type="menu" dropdownId={dropdownId}>
      <Dropdown.Trigger
        render={
          <LightIconButton emphasis="subtle" aria-label={t`More options`}>
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <Dropdown.Content side="right" align="start">
        <Dropdown.Section>
          <Dropdown.ActionItem
            color="danger"
            startIcon={<IconTrash />}
            onClick={onRevoke}
          >{t`Revoke`}</Dropdown.ActionItem>
        </Dropdown.Section>
      </Dropdown.Content>
    </DropdownRoot>
  );
};
