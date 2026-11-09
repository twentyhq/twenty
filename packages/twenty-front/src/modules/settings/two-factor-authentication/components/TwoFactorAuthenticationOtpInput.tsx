import { TwoFactorAuthenticationVerificationCodeDash } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationVerificationCodeDash';
import { TwoFactorAuthenticationVerificationCodeSlot } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationVerificationCodeSlot';
import { TWO_FACTOR_AUTHENTICATION_OTP_LENGTH } from '@/settings/two-factor-authentication/constants/TwoFactorAuthenticationOtpLength';
import { styled } from '@linaria/react';
import { OTPInput, type SlotProps } from 'input-otp';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledOTPContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};

  &:has(:disabled) {
    opacity: 0.3;
  }
`;

type TwoFactorAuthenticationOtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

export const TwoFactorAuthenticationOtpInput = ({
  value,
  onChange,
  onBlur,
}: TwoFactorAuthenticationOtpInputProps) => {
  const renderSlot = (slot: SlotProps, index: number) => (
    <TwoFactorAuthenticationVerificationCodeSlot
      key={index}
      char={slot.char}
      placeholderChar={slot.placeholderChar}
      isActive={slot.isActive}
      hasFakeCaret={slot.hasFakeCaret}
    />
  );

  return (
    <OTPInput
      maxLength={TWO_FACTOR_AUTHENTICATION_OTP_LENGTH}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      autoFocus
      render={({ slots }) => (
        <StyledOTPContainer>
          {slots.slice(0, 3).map(renderSlot)}
          <TwoFactorAuthenticationVerificationCodeDash />
          {slots.slice(3).map((slot, index) => renderSlot(slot, index + 3))}
        </StyledOTPContainer>
      )}
    />
  );
};
