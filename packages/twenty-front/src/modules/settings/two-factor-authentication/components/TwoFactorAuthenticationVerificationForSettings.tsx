import styled from '@emotion/styled';
import { OTPInput } from 'input-otp';
import { Controller, useFormContext } from 'react-hook-form';

import { TwoFactorAuthenticationVerificationCodeDash } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationVerificationCodeDash';
import { TwoFactorAuthenticationVerificationCodeSlot } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationVerificationCodeSlot';

// OTP Form Types
type OTPFormValues = {
  otp: string;
};

const StyledOTPContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-bottom: ${({ theme }) => theme.spacing(8)};

  &:has(:disabled) {
    opacity: 0.3;
  }
`;

export const TwoFactorAuthenticationVerificationForSettings = () => {
  const formContext = useFormContext<OTPFormValues>();

  return (
    <Controller
      name="otp"
      control={formContext.control}
      render={({ field: { onChange, onBlur, value } }) => (
        <OTPInput
          maxLength={6}
          onBlur={onBlur}
          onChange={onChange}
          value={value}
          render={({ slots }) => (
            <StyledOTPContainer>
              {slots.slice(0, 3).map((slot, idx) => (
                <TwoFactorAuthenticationVerificationCodeSlot
                  key={idx}
                  char={slot.char}
                  placeholderChar={slot.placeholderChar}
                  isActive={slot.isActive}
                  hasFakeCaret={slot.hasFakeCaret}
                />
              ))}
              <TwoFactorAuthenticationVerificationCodeDash />
              {slots.slice(3).map((slot, idx) => (
                <TwoFactorAuthenticationVerificationCodeSlot
                  key={idx + 3}
                  char={slot.char}
                  placeholderChar={slot.placeholderChar}
                  isActive={slot.isActive}
                  hasFakeCaret={slot.hasFakeCaret}
                />
              ))}
            </StyledOTPContainer>
          )}
        />
      )}
    />
  );
};
