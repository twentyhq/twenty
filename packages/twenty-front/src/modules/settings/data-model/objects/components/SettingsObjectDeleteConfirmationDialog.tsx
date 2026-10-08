import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useLingui } from '@lingui/react/macro';

type SettingsObjectDeleteConfirmationDialogProps = {
  dialogId: string;
  objectLabel: string;
  onConfirmClick: () => void;
  onClose?: () => void;
  loading?: boolean;
};

export const SettingsObjectDeleteConfirmationDialog = ({
  dialogId,
  objectLabel,
  onConfirmClick,
  onClose,
  loading,
}: SettingsObjectDeleteConfirmationDialogProps) => {
  const { t } = useLingui();

  return (
    <ConfirmationDialog
      dialogId={dialogId}
      title={t`Delete ${objectLabel} object?`}
      subtitle={t`This will permanently delete the object and all its records. Type "yes" to confirm.`}
      confirmButtonText={t`Delete`}
      onConfirmClick={onConfirmClick}
      onClose={onClose}
      confirmationValue="yes"
      confirmationPlaceholder="yes"
      loading={loading}
    />
  );
};
