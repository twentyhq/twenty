import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useLingui } from '@lingui/react/macro';

type SettingsFieldDeleteConfirmationDialogProps = {
  dialogId: string;
  fieldLabel: string;
  objectLabel: string;
  onConfirmClick: () => void;
  onClose?: () => void;
  loading?: boolean;
};

export const SettingsFieldDeleteConfirmationDialog = ({
  dialogId,
  fieldLabel,
  objectLabel,
  onConfirmClick,
  onClose,
  loading,
}: SettingsFieldDeleteConfirmationDialogProps) => {
  const { t } = useLingui();

  return (
    <ConfirmationDialog
      dialogId={dialogId}
      title={t`Delete ${fieldLabel} field?`}
      subtitle={t`This will permanently delete the field and all its data from ${objectLabel}. Type "yes" to confirm.`}
      confirmButtonText={t`Delete`}
      confirmationValue="yes"
      confirmationPlaceholder="yes"
      onConfirmClick={onConfirmClick}
      onClose={onClose}
      loading={loading}
    />
  );
};
