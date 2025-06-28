/* @license Enterprise */

import styled from '@emotion/styled';
import { css } from '@emotion/react';

import React from 'react';
import { useAuth } from '@/auth/hooks/useAuth';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui, Trans } from '@lingui/react/macro';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { AppPath } from '@/types/AppPath';
import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';
import { getLoginToken } from '@/apollo/utils/getLoginToken';
import { MainButton } from 'twenty-ui/input';
import { OTPInput, SlotProps } from 'input-otp';
import {
  OTPFormValues,
  useTwoFactorAuthenticationForm,
} from '../../hooks/useTwoFactorAuthenticationForm';
import { Controller } from 'react-hook-form';

const StyledMainContentContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  text-align: center;
  space-y: 5px;
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

  &:first-child {
    border-left: 1px solid ${({ theme }) => theme.border.color.medium};
    border-top-left-radius: 0.375rem;
    border-bottom-left-radius: 0.375rem;
  }

  &:last-child {
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
  height: 2rem; /* h-8 */
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

export const SignInUpTOTPVerification = () => {
  const { getAuthTokensFromOTP } = useAuth();
  const { enqueueSnackBar } = useSnackBar();

  const navigate = useNavigateApp();
  const { readCaptchaToken } = useReadCaptchaToken();
  const loginToken = getLoginToken();
  const { t } = useLingui();

  const { form } = useTwoFactorAuthenticationForm();

  const submitOTP = async (values: OTPFormValues) => {
    const captchaToken = await readCaptchaToken();

    if (!loginToken) {
      enqueueSnackBar(t`Invalid email verification link.`, {
        dedupeKey: 'email-verification-link-dedupe-key',
        variant: SnackBarVariant.Error,
      });
      return navigate(AppPath.SignInUp);
    }

    await getAuthTokensFromOTP(values.otp, loginToken, captchaToken);

    //TODO: AAAHpClientConfigProviderEffect
    // getAuthTokensFromOtp({
    //   variables: {
    //     captchaToken,
    //     origin,
    //     otp: values.otp,
    //     loginToken
    //   },
    //   onCompleted: async (data) => {
    //     setAuthTokens(data.getAuthTokensFromOTP.tokens);
    //     const { user } = await loadCurrentUser();

    // const availableWorkspacesCount = countAvailableWorkspaces(
    //       user.availableWorkspaces,
    //     );

    //     if (availableWorkspacesCount === 0) {
    //       return createWorkspace();
    //     }

    //     if (availableWorkspacesCount === 1) {
    //       const targetWorkspace = getFirstAvailableWorkspaces(
    //         user.availableWorkspaces,
    //       );
    //       return await redirectToWorkspaceDomain(
    //         getWorkspaceUrl(targetWorkspace.workspaceUrls),
    //         targetWorkspace.loginToken ? AppPath.Verify : AppPath.SignInUp,
    //         {
    //           ...(targetWorkspace.loginToken && {
    //             loginToken: targetWorkspace.loginToken,
    //           }),
    //           email: user.email,
    //         },
    //       );
    //     }

    //     // setSignInUpStep(SignInUpStep.WorkspaceSelection);
    //   },
    //   onError: (data) => {
    //     console.log({data})
    //   }
    // })
  };

  return (
    <StyledForm onSubmit={form.handleSubmit(submitOTP)}>
      <StyledTextContainer>
        <Trans>Copy paste the code below</Trans>
      </StyledTextContainer>
      <StyledMainContentContainer>
        {/* // eslint-disable-next-line react/jsx-props-no-spreading */}
        <Controller
          name="otp"
          control={form.control}
          render={({
            field: { onChange, onBlur, value },
            //TODO: AAAH
          }) => (
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
        title={'Submit'}
        type="submit"
        variant={'primary'}
        fullWidth
      />
    </StyledForm>
  );
};
