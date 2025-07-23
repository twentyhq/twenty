import { useMutation } from '@apollo/client';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { OTPInput, SlotProps } from 'input-otp';
import { useState } from 'react';
import { Controller, useForm, useFormContext } from 'react-hook-form';

import { useAuth } from '@/auth/hooks/useAuth';
import { VERIFY_TWO_FACTOR_AUTHENTICATION_METHOD_FOR_AUTHENTICATED_USER } from '@/settings/two-factor-authentication/graphql/mutations/verifyTwoFactorAuthenticationMethod';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

// OTP Form Types
type OTPFormValues = {
  otp: string;
};

const StyledOTPContainer = styled.div`
  display: flex;

  margin-bottom: ${({ theme }) => theme.spacing(8)};

  &:has(:disabled) {
    opacity: 0.3;
  }
`;

const StyledSlotGroup = styled.div`
  display: flex;
`;

const StyledSlot = styled.div<{ isActive: boolean }>`
  position: relative;
  width: 2.5rem;
  height: 3.5rem;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  border-top: 1px solid ${({ theme }) => theme.border.color.medium};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  border-right: 1px solid ${({ theme }) => theme.border.color.medium};

  &:first-of-type {
    border-left: 1px solid ${({ theme }) => theme.border.color.medium};
    border-top-left-radius: 0.375rem;
    border-bottom-left-radius: 0.375rem;
  }

  &:last-of-type {
    border-top-right-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;
  }

  .group:hover &,
  .group:focus-within & {
    border-color: ${({ theme }) => theme.border.color.medium};
  }

  outline: 0;
  outline-color: ${({ theme }) => theme.border.color.medium};

  ${({ isActive, theme }) =>
    isActive &&
    css`
      outline-width: 1px;
      outline-style: solid;
      outline-color: ${theme.border.color.strong};
    `}
`;

const StyledPlaceholderChar = styled.div`
  .group:has(input[data-input-otp-placeholder-shown]) & {
    opacity: 0.2;
  }
`;

const StyledCaretContainer = styled.div`
  align-items: center;
  animation: caret-blink 1s steps(2, start) infinite;
  display: flex;
  inset: 0;
  justify-content: center;
  pointer-events: none;
  position: absolute;

  @keyframes caret-blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }
`;

const StyledCaret = styled.div`
  width: 1px;
  height: 2rem;
  background-color: ${({ theme }) => theme.font.color.primary};
`;

const StyledDashContainer = styled.div`
  display: flex;
  width: 2.5rem;
  justify-content: center;
  align-items: center;
`;

const StyledDash = styled.div`
  background-color: ${({ theme }) => theme.font.color.tertiary};
  border-radius: 9999px;
  height: 0.25rem;
  width: 0.75rem;
`;

const FakeCaret = () => {
  return (
    <StyledCaretContainer>
      <StyledCaret />
    </StyledCaretContainer>
  );
};

const FakeDash = () => {
  return (
    <StyledDashContainer>
      <StyledDash />
    </StyledDashContainer>
  );
};

export const Slot = (props: SlotProps) => {
  return (
    <StyledSlot isActive={props.isActive}>
      <StyledPlaceholderChar>
        {props.char ?? props.placeholderChar}
      </StyledPlaceholderChar>
      {props.hasFakeCaret && <FakeCaret />}
    </StyledSlot>
  );
};

export const useTwoFactorVerificationForSettings = () => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const navigate = useNavigateSettings();
  const { t } = useLingui();
  const [isLoading, setIsLoading] = useState(false);
  const { loadCurrentUser } = useAuth();

  const [verifyTwoFactorAuthenticationMethod] = useMutation(
    VERIFY_TWO_FACTOR_AUTHENTICATION_METHOD_FOR_AUTHENTICATED_USER,
  );

  const formConfig = useForm<OTPFormValues>({
    mode: 'onChange',
    defaultValues: {
      otp: '',
    },
  });

  const { isSubmitting } = formConfig.formState;
  const otpValue = formConfig.watch('otp');
  const canSave = !isSubmitting && otpValue?.length === 6;

  const handleVerificationSuccess = async () => {
    enqueueSuccessSnackBar({
      message: t`Two-factor authentication setup completed successfully!`,
    });

    // Reload current user to refresh 2FA status
    await loadCurrentUser();

    // Navigate back to profile page
    navigate(SettingsPath.ProfilePage);
  };

  const handleSave = async (values: OTPFormValues) => {
    try {
      setIsLoading(true);

      await verifyTwoFactorAuthenticationMethod({
        variables: {
          otp: values.otp,
        },
      });

      await handleVerificationSuccess();
    } catch (error) {
      enqueueErrorSnackBar({
        message: t`Invalid verification code. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form and navigate back to profile page
    formConfig.reset();
    navigate(SettingsPath.ProfilePage);
  };

  return {
    formConfig,
    isLoading,
    canSave,
    isSubmitting,
    handleSave,
    handleCancel,
  };
};

export const TwoFactorAuthenticationVerificationForSettings = () => {
  // Use the form context from the parent instead of creating a new form instance
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
              <StyledSlotGroup>
                {slots.slice(0, 3).map((slot, idx) => (
                  <Slot
                    key={idx}
                    char={slot.char}
                    placeholderChar={slot.placeholderChar}
                    isActive={slot.isActive}
                    hasFakeCaret={slot.hasFakeCaret}
                  />
                ))}
              </StyledSlotGroup>
              <FakeDash />
              <StyledSlotGroup>
                {slots.slice(3).map((slot, idx) => (
                  <Slot
                    key={idx}
                    char={slot.char}
                    placeholderChar={slot.placeholderChar}
                    isActive={slot.isActive}
                    hasFakeCaret={slot.hasFakeCaret}
                  />
                ))}
              </StyledSlotGroup>
            </StyledOTPContainer>
          )}
        />
      )}
    />
  );
};
