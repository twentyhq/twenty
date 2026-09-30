import { TwoFactorAuthenticationVerificationCodeDash } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationVerificationCodeDash';
import { TwoFactorAuthenticationVerificationCodeSlot } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationVerificationCodeSlot';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { OTPInput } from 'input-otp';
import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

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
  const [otp, setOtp] = useState('');

  return (
    <ConfirmationDialog
      dialogId={dialogId}
      title={t`Generate a recovery code`}
      confirmButtonColor="accent"
      confirmButtonText={t`Generate code`}
      onConfirmClick={() => {
        onConfirm(otp);
        setOtp('');
      }}
      onClose={() => setOtp('')}
      subtitle={
        <StyledConfirmationContent>
          <div>
            {t`The code lets ${memberName} sign in to this workspace once without their authenticator app. Using it removes their current authenticator and signs them out of their other sessions here. They will be notified by email.`}
          </div>
          <div>{t`Enter your two-factor authentication code to confirm.`}</div>
          <OTPInput
            maxLength={6}
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
