import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { t } from '@lingui/core/macro';

type SettingsAdminRevokeSigningKeyConfirmationModalProps = {
  modalInstanceId: string;
  isCurrent: boolean;
  onConfirm: () => void;
  onClose?: () => void;
};

export const SettingsAdminRevokeSigningKeyConfirmationModal = ({
  modalInstanceId,
  isCurrent,
  onConfirm,
  onClose,
}: SettingsAdminRevokeSigningKeyConfirmationModalProps) => {
  const subtitle = isCurrent
    ? t`This is the current signing key. Revoking it will invalidate every JWT signed with it and users may need to sign in again. A new signing key will be generated automatically on the next request.`
    : t`Revoking this key will invalidate every JWT signed with it. Users with active tokens signed by this key will be logged out.`;

  return (
    <ConfirmationModal
      modalInstanceId={modalInstanceId}
      title={t`Revoke signing key`}
      subtitle={subtitle}
      onConfirmClick={onConfirm}
      onClose={onClose}
      confirmButtonText={t`Revoke`}
      confirmButtonAccent="danger"
    />
  );
};
