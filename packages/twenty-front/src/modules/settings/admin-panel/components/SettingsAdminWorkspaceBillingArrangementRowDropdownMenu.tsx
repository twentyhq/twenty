import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconCircleX, IconDotsVertical } from 'twenty-ui/icon';

import { END_BILLING_ARRANGEMENT_DIALOG_ID } from '@/settings/admin-panel/constants/EndBillingArrangementDialogId';
import { adminPanelBillingArrangementIdPendingEndState } from '@/settings/admin-panel/states/adminPanelBillingArrangementIdPendingEndState';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

type SettingsAdminWorkspaceBillingArrangementRowDropdownMenuProps = {
  billingArrangementId: string;
};

export const SettingsAdminWorkspaceBillingArrangementRowDropdownMenu = ({
  billingArrangementId,
}: SettingsAdminWorkspaceBillingArrangementRowDropdownMenuProps) => {
  const { t } = useLingui();
  const { openDialog } = useDialog();
  const setAdminPanelBillingArrangementIdPendingEnd = useSetAtomState(
    adminPanelBillingArrangementIdPendingEndState,
  );

  const handleEndClick = () => {
    setAdminPanelBillingArrangementIdPendingEnd(billingArrangementId);
    openDialog(END_BILLING_ARRANGEMENT_DIALOG_ID);
  };

  return (
    <DropdownRoot
      type="menu"
      dropdownId={`settings-admin-billing-arrangement-row-${billingArrangementId}`}
    >
      <Dropdown.Trigger
        render={
          <LightIconButton
            emphasis="subtle"
            aria-label={t`More options`}
            onClick={(event) => event.stopPropagation()}
          >
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <DropdownContent
        side="right"
        align="start"
        onClick={(event) => event.stopPropagation()}
      >
        <Dropdown.Section>
          <Dropdown.ActionItem
            color="danger"
            startIcon={<IconCircleX />}
            onClick={handleEndClick}
          >{t`End`}</Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
