import { TwoFactorAuthenticationOtpConfirmationDialog } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationOtpConfirmationDialog';
import { useLingui } from '@lingui/react/macro';

type TwoFactorAuthenticationRecoveryCodeConfirmationDialogProps = {
  dialogId: string;
  memberName: string;
  onConfirm: (otp: string) => void;
};

export const TwoFactorAuthenticationRecoveryCodeConfirmationDialog = ({
  dialogId,
  memberName,
  onConfirm,
}: TwoFactorAuthenticationRecoveryCodeConfirmationDialogProps) => {
  const { t } = useLingui();

  return (
    <TwoFactorAuthenticationOtpConfirmationDialog
      dialogId={dialogId}
      title={t`Generate a recovery code`}
      description={t`The code lets ${memberName} sign in to this workspace once without their authenticator app. Using it removes their current authenticator and signs them out of their other sessions here. They will be notified by email.`}
      confirmButtonText={t`Generate code`}
      onConfirm={onConfirm}
    />
  );
};
