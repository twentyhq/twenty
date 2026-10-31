import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { useToast } from 'twenty-ui/components/feedback';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical, IconUnlink } from 'twenty-ui/icon';

type SettingsApplicationAuthorizationRowDropdownMenuProps = {
  applicationAuthorizationId: string;
  revokeLabel: string;
  confirmationTitle: string;
  confirmationSubtitle: ReactNode;
  onRevoke: (applicationAuthorizationId: string) => Promise<unknown>;
};

export const SettingsApplicationAuthorizationRowDropdownMenu = ({
  applicationAuthorizationId,
  revokeLabel,
  confirmationTitle,
  confirmationSubtitle,
  onRevoke,
}: SettingsApplicationAuthorizationRowDropdownMenuProps) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { openDialog } = useDialog();

  const revokeDialogId = `revoke-application-authorization-${applicationAuthorizationId}`;

  return (
    <>
      <DropdownRoot
        type="menu"
        dropdownId={`settings-application-authorization-row-${applicationAuthorizationId}`}
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
              startIcon={<IconUnlink />}
              onClick={() => openDialog(revokeDialogId)}
            >
              {revokeLabel}
            </Dropdown.ActionItem>
          </Dropdown.Section>
        </DropdownContent>
      </DropdownRoot>
      <ConfirmationDialog
        dialogId={revokeDialogId}
        title={confirmationTitle}
        subtitle={confirmationSubtitle}
        onConfirmClick={async () => {
          try {
            await onRevoke(applicationAuthorizationId);
          } catch (error) {
            enqueueToast(getToastOptionsFromError({ error }));
          }
        }}
        confirmButtonText={revokeLabel}
        shouldWaitForConfirmBeforeClosing
      />
    </>
  );
};
