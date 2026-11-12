import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconCircleX, IconDotsVertical } from 'twenty-ui/icon';

import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';

type SettingsAdminWorkspaceBillingArrangementRowDropdownMenuProps = {
  billingArrangementId: string;
  onEnd: () => void;
};

export const SettingsAdminWorkspaceBillingArrangementRowDropdownMenu = ({
  billingArrangementId,
  onEnd,
}: SettingsAdminWorkspaceBillingArrangementRowDropdownMenuProps) => {
  const { t } = useLingui();

  return (
    <DropdownRoot
      type="menu"
      dropdownId={`settings-admin-billing-arrangement-row-${billingArrangementId}`}
    >
      <Dropdown.Trigger
        render={
          <LightIconButton emphasis="subtle" aria-label={t`More options`}>
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <DropdownContent side="right" align="start">
        <Dropdown.Section>
          <Dropdown.ActionItem
            color="danger"
            startIcon={<IconCircleX />}
            onClick={onEnd}
          >{t`End`}</Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
