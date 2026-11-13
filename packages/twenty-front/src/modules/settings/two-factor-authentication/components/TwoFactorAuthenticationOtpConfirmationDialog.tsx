import { TwoFactorAuthenticationOtpInput } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationOtpInput';
import { TWO_FACTOR_AUTHENTICATION_OTP_LENGTH } from '@/settings/two-factor-authentication/constants/TwoFactorAuthenticationOtpLength';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';
import { useLingui } from '@lingui/react/macro';

const StyledConfirmationContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

type TwoFactorAuthenticationOtpConfirmationDialogProps = {
  dialogId: string;
  title: string;
  description: string;
  confirmButtonText: string;
  onConfirm: (otp: string) => void;
};

export const TwoFactorAuthenticationOtpConfirmationDialog = ({
  dialogId,
  title,
  description,
  confirmButtonText,
  onConfirm,
}: TwoFactorAuthenticationOtpConfirmationDialogProps) => {
  const { t } = useLingui();
  const [otp, setOtp] = useState('');

  return (
    <ConfirmationDialog
      dialogId={dialogId}
      title={title}
      confirmButtonColor="accent"
      confirmButtonText={confirmButtonText}
      isConfirmButtonDisabled={
        otp.length !== TWO_FACTOR_AUTHENTICATION_OTP_LENGTH
      }
      onConfirmClick={() => {
        onConfirm(otp);
        setOtp('');
      }}
      onClose={() => setOtp('')}
      subtitle={
        <StyledConfirmationContent>
          <div>{description}</div>
          <div>{t`Enter your two-factor authentication code to confirm.`}</div>
          <TwoFactorAuthenticationOtpInput value={otp} onChange={setOtp} />
        </StyledConfirmationContent>
      }
    />
  );
};
