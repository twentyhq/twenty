import { styled } from '@linaria/react';
import { Controller, useFormContext } from 'react-hook-form';
import { themeCssVariables } from 'twenty-ui/theme';

import { TwoFactorAuthenticationOtpInput } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationOtpInput';

type OTPFormValues = {
  otp: string;
};

const StyledOTPInputContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[8]};
`;

export const TwoFactorAuthenticationVerificationForSettings = () => {
  const formContext = useFormContext<OTPFormValues>();

  return (
    <Controller
      name="otp"
      control={formContext.control}
      render={({ field: { onChange, onBlur, value } }) => (
        <StyledOTPInputContainer>
          <TwoFactorAuthenticationOtpInput
            value={value}
            onChange={onChange}
            onBlur={onBlur}
          />
        </StyledOTPInputContainer>
      )}
    />
  );
};
