import { styled } from '@linaria/react';

import { useAuth } from '@/auth/hooks/useAuth';
import {
  type OTPFormValues,
  useTwoFactorAuthenticationForm,
} from '@/auth/sign-in-up/hooks/useTwoFactorAuthenticationForm';
import { loginTokenState } from '@/auth/states/loginTokenState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';
import { useCaptcha } from '@/client-config/hooks/useCaptcha';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Trans, useLingui } from '@lingui/react/macro';
import { OTPInput, type SlotProps } from 'input-otp';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { AppPath } from 'twenty-shared/types';
import { MainButton } from 'twenty-ui/input';
import { ClickToActionLink } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const StyledMainContentContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[8]};
  margin-top: ${themeCssVariables.spacing[4]};
  text-align: center;
`;

const StyledForm = styled.form`
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
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
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  border-right: 1px solid ${themeCssVariables.border.color.medium};

  &:first-of-type {
    border-left: 1px solid ${themeCssVariables.border.color.medium};
    border-top-left-radius: 0.375rem;
    border-bottom-left-radius: 0.375rem;
  }

  &:last-of-type {
    border-top-right-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;
  }

  .group:hover &,
  .group:focus-within & {
    border-color: ${themeCssVariables.border.color.medium};
  }

  outline-width: ${({ isActive }) => (isActive ? '1px' : '0')};
  outline-style: ${({ isActive }) => (isActive ? 'solid' : 'none')};
  outline-color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.border.color.strong
      : themeCssVariables.border.color.medium};
`;

const StyledPlaceholderChar = styled.div`
  .group:has(input[data-input-otp-placeholder-shown]) & {
    opacity: 0.2;
  }
`;

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
  background-color: ${themeCssVariables.font.color.light};
`;

const FakeCaret = () => {
  return (
    <StyledCaretContainer>
      <StyledCaret />
    </StyledCaretContainer>
  );
};

const StyledDashContainer = styled.div`
  display: flex;
  width: 2.5rem;
  justify-content: center;
  align-items: center;
`;

const StyledDash = styled.div`
  background-color: ${themeCssVariables.font.color.primary};
  border-radius: 9999px;
  height: 0.25rem;
  width: 0.75rem;
`;

const FakeDash = () => {
  return (
    <StyledDashContainer>
      <StyledDash />
    </StyledDashContainer>
  );
};

const StyledOTPContainer = styled.div`
  display: flex;
  align-items: center;

  &:has(:disabled) {
    opacity: 0.3;
  }
`;

const StyledSlotGroup = styled.div`
  display: flex;
`;
const StyledTextContainer = styled.div`
  align-items: center;
  margin-bottom: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.font.color.tertiary};

  max-width: 280px;
  text-align: center;
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledActionBackLinkContainer = styled.div`
  margin: ${themeCssVariables.spacing[3]} 0 0;
`;

export const SignInUpTOTPVerification = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { getAuthTokensFromOTP } = useAuth();
  const { enqueueErrorSnackBar } = useSnackBar();

  const navigate = useNavigateApp();
  const { readCaptchaToken } = useReadCaptchaToken();
  const { isCaptchaReady } = useCaptcha();
  const loginToken = useAtomStateValue(loginTokenState);
  const setSignInUpStep = useSetAtomState(signInUpStepState);
  const { t } = useLingui();

  const { form } = useTwoFactorAuthenticationForm();

  const submitOTP = async (values: OTPFormValues) => {
    setIsLoading(true);
    try {
      if (!isCaptchaReady) {
        enqueueErrorSnackBar({
          message: t`Captcha (anti-bot check) is still loading, try again`,
        });
        setIsLoading(false);
        return;
      }

      const captchaToken = readCaptchaToken();

      if (!loginToken) {
        return navigate(AppPath.SignInUp);
      }

      await getAuthTokensFromOTP(values.otp, loginToken, captchaToken);
    } catch {
      form.setValue('otp', '');

      enqueueErrorSnackBar({
        message: t`Invalid verification code. Please try again.`,
        options: {
          dedupeKey: 'invalid-otp-dedupe-key',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setSignInUpStep(SignInUpStep.TwoFactorAuthenticationProvision);
  };

  return (
    <StyledForm onSubmit={form.handleSubmit(submitOTP)}>
      <StyledTextContainer>
        <Trans>Paste the code below</Trans>
      </StyledTextContainer>
      <StyledMainContentContainer>
        {/* // oxlint-disable-next-line react/jsx-props-no-spreading */}
        <Controller
          name="otp"
          control={form.control}
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
                        // oxlint-disable-next-line react/jsx-props-no-spreading
                        {...slot}
                      />
                    ))}
                  </StyledSlotGroup>

                  <FakeDash />

                  <StyledSlotGroup>
                    {slots.slice(3).map((slot, idx) => (
                      <Slot
                        key={idx}
                        // oxlint-disable-next-line react/jsx-props-no-spreading
                        {...slot}
                      />
                    ))}
                  </StyledSlotGroup>
                </StyledOTPContainer>
              )}
            />
          )}
        />
      </StyledMainContentContainer>
      <MainButton
        title={t`Submit`}
        type="submit"
        variant="primary"
        fullWidth
        disabled={isLoading}
      />
      <StyledActionBackLinkContainer>
        <ClickToActionLink onClick={handleBack}>
          <Trans>Back</Trans>
        </ClickToActionLink>
      </StyledActionBackLinkContainer>
    </StyledForm>
  );
};
