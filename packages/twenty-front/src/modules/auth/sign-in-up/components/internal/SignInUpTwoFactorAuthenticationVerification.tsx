import { css } from '@emotion/react';
import styled from '@emotion/styled';

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
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { AppPath } from 'twenty-shared/types';
import { MainButton } from 'twenty-ui/input';
import { ClickToActionLink } from 'twenty-ui/navigation';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const StyledMainContentContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
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
  background-color: white;
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
  background-color: black;
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
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  color: ${({ theme }) => theme.font.color.tertiary};

  max-width: 280px;
  text-align: center;
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledActionBackLinkContainer = styled.div`
  margin: ${({ theme }) => theme.spacing(3)} 0 0;
`;

export const SignInUpTOTPVerification = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { getAuthTokensFromOTP } = useAuth();
  const { enqueueErrorSnackBar } = useSnackBar();

  const navigate = useNavigateApp();
  const { readCaptchaToken } = useReadCaptchaToken();
  const { isCaptchaReady } = useCaptcha();
  const loginToken = useRecoilValue(loginTokenState);
  const setSignInUpStep = useSetRecoilState(signInUpStepState);
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
        {/* // eslint-disable-next-line react/jsx-props-no-spreading */}
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
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...slot}
                      />
                    ))}
                  </StyledSlotGroup>

                  <FakeDash />

                  <StyledSlotGroup>
                    {slots.slice(3).map((slot, idx) => (
                      <Slot
                        key={idx}
                        // eslint-disable-next-line react/jsx-props-no-spreading
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
