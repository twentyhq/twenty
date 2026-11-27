import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical, IconUnlink } from 'twenty-ui/icon';

type SettingsRevokeAccessDropdownMenuProps = {
  dropdownId: string;
  onRevokeAccess: () => void;
};

export const SettingsRevokeAccessDropdownMenu = ({
  dropdownId,
  onRevokeAccess,
}: SettingsRevokeAccessDropdownMenuProps) => {
  const { t } = useLingui();

  return (
    <DropdownRoot type="menu" dropdownId={dropdownId}>
      <Dropdown.Trigger
        render={
          <LightIconButton emphasis="subtle" aria-label={t`More options`}>
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <DropdownContent side="bottom" align="end">
        <Dropdown.Section>
          <Dropdown.ActionItem
            color="danger"
            startIcon={<IconUnlink />}
            onClick={onRevokeAccess}
          >{t`Revoke access`}</Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
