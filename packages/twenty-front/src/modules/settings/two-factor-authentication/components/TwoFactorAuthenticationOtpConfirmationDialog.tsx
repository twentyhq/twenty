import { TwoFactorAuthenticationVerificationCodeDash } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationVerificationCodeDash';
import { TwoFactorAuthenticationVerificationCodeSlot } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationVerificationCodeSlot';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { styled } from '@linaria/react';
import { OTPInput } from 'input-otp';
import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';
import { useLingui } from '@lingui/react/macro';

const OTP_LENGTH = 6;

const StyledConfirmationContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledOTPContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
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
      isConfirmButtonDisabled={otp.length !== OTP_LENGTH}
      onConfirmClick={() => {
        onConfirm(otp);
        setOtp('');
      }}
      onClose={() => setOtp('')}
      subtitle={
        <StyledConfirmationContent>
          <div>{description}</div>
          <div>{t`Enter your two-factor authentication code to confirm.`}</div>
          <OTPInput
            maxLength={OTP_LENGTH}
            value={otp}
            onChange={setOtp}
            autoFocus
            render={({ slots }) => (
              <StyledOTPContainer>
                {slots.slice(0, 3).map((slot, index) => (
                  <TwoFactorAuthenticationVerificationCodeSlot
                    key={index}
                    char={slot.char}
                    placeholderChar={slot.placeholderChar}
                    isActive={slot.isActive}
                    hasFakeCaret={slot.hasFakeCaret}
                  />
                ))}
                <TwoFactorAuthenticationVerificationCodeDash />
                {slots.slice(3).map((slot, index) => (
                  <TwoFactorAuthenticationVerificationCodeSlot
                    key={index + 3}
                    char={slot.char}
                    placeholderChar={slot.placeholderChar}
                    isActive={slot.isActive}
                    hasFakeCaret={slot.hasFakeCaret}
                  />
                ))}
              </StyledOTPContainer>
            )}
          />
        </StyledConfirmationContent>
      }
    />
  );
};
