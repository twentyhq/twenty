import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useId } from 'react';
import { IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

type SettingsApplicationUninstallButtonProps = {
  onUninstall: () => void;
  isUninstalling?: boolean;
};

export const SettingsApplicationUninstallButton = ({
  onUninstall,
  isUninstalling,
}: SettingsApplicationUninstallButtonProps) => {
  const { openDialog } = useDialog();
  const uninstallDialogId = useId();

  const confirmationValue = t`yes`;

  return (
    <>
      <Button
        startIcon={<IconTrash />}
        variant="outline"
        color="danger"
        size="sm"
        onClick={() => openDialog(uninstallDialogId)}
        disabled={isUninstalling}
      >
        {isUninstalling ? t`Uninstalling...` : t`Uninstall`}
      </Button>
      <ConfirmationDialog
        confirmationPlaceholder={confirmationValue}
        confirmationValue={confirmationValue}
        dialogId={uninstallDialogId}
        title={t`Uninstall Application?`}
        subtitle={
          <Trans>
            Please type {`"${confirmationValue}"`} to confirm you want to
            uninstall this application.
          </Trans>
        }
        onConfirmClick={onUninstall}
        confirmButtonText={t`Uninstall`}
        loading={isUninstalling}
      />
    </>
  );
};
