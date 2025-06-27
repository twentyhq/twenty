/* @license Enterprise */

import { useSSO } from '@/auth/sign-in-up/hooks/useSSO';
import { guessSSOIdentityProviderIconByUrl } from '@/settings/security/utils/guessSSOIdentityProviderIconByUrl';
import styled from '@emotion/styled';
import { css } from '@emotion/react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import React, { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useAuth } from '@/auth/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { AppPath } from '@/types/AppPath';
import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';
import { useOrigin } from '@/domain-manager/hooks/useOrigin';
import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { getLoginToken } from '@/apollo/utils/getLoginToken';
import { qrCodeState } from '@/auth/states/qrCode';
import { Loader } from 'twenty-ui/feedback';
import QRCode from "react-qr-code";
import { Trans } from '@lingui/react/macro';
import { MainButton } from 'twenty-ui/input';
import { SignInUpStep, signInUpStepState } from '@/auth/states/signInUpStepState';
import { OTPInput, SlotProps } from 'input-otp';
import { OTPFormValues, useTwoFactorAuthenticationForm } from '../../hooks/useTwoFactorAuthenticationForm';
import { Controller, FormProvider } from 'react-hook-form';
import { useGetAuthTokensFromOtpMutation } from '~/generated/graphql';
import { countAvailableWorkspaces, getFirstAvailableWorkspaces } from '@/auth/utils/availableWorkspacesUtils';
import { useSignUpInNewWorkspace } from '../../hooks/useSignUpInNewWorkspace';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';

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
  border-top: 1px solid black;
  border-bottom: 1px solid black;
  border-right: 1px solid black;

  &:first-child {
    border-left: 1px solid black;
    border-top-left-radius: 0.375rem;
    border-bottom-left-radius: 0.375rem;
  }

  &:last-child {
    border-top-right-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;
  }

  .group:hover &,
  .group:focus-within & {
    border-color: rgba(var(--accent-foreground-rgb), 0.1);
  }

  outline: 0;
  outline-color: rgba(var(--accent-foreground-rgb), 0.2);

  ${({ isActive }) =>
    isActive &&
    css`
      outline-width: 1px;
      outline-style: solid;
      outline-color: black;
    `}
`

const PlaceholderChar = styled.div`
  .group:has(input[data-input-otp-placeholder-shown]) & {
    opacity: 0.2;
  }
`

export function Slot(props: SlotProps) {
  return (
    <StyledSlot isActive={props.isActive}>
      <PlaceholderChar>
        {props.char ?? props.placeholderChar}
      </PlaceholderChar>
      {props.hasFakeCaret && <FakeCaret />}
    </StyledSlot>
  )
}

const CaretContainer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: caret-blink 1s steps(2, start) infinite;

  @keyframes caret-blink {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }
`

const Caret = styled.div`
  width: 1px;
  height: 2rem; /* h-8 */
  background-color: white;
`

export function FakeCaret() {
  return (
    <CaretContainer>
      <Caret />
    </CaretContainer>
  )
}

const DashContainer = styled.div`
  display: flex;
  width: 2.5rem;
  justify-content: center;
  align-items: center;
`

const Dash = styled.div`
  width: 0.75rem;
  height: 0.25rem;
  border-radius: 9999px;
  background-color: black;
`

export function FakeDash() {
  return (
    <DashContainer>
      <Dash />
    </DashContainer>
  )
}

const OTPContainer = styled.div`
  display: flex;
  align-items: center;

  &:has(:disabled) {
    opacity: 0.3;
  }
`

const SlotGroup = styled.div`
  display: flex;
`
const StyledTextContainer = styled.div`
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  color: ${({ theme }) => theme.font.color.tertiary};
  
  max-width: 280px;
  text-align: center;
  font-size: ${({ theme }) => theme.font.size.sm};
`;

export const SignInUpTOTPVerification = () => {
  const { loadCurrentUser, getAuthTokensFromOTP } = useAuth()
  const { enqueueSnackBar } = useSnackBar();

  const navigate = useNavigateApp();
  const { readCaptchaToken } = useReadCaptchaToken();
  const { origin } = useOrigin()
  const loginToken = getLoginToken();
  const setQrCodeState = useSetRecoilState(qrCodeState);
  const qrCode = useRecoilValue(qrCodeState);
  const setSignInUpStep = useSetRecoilState(signInUpStepState);
  const [getAuthTokensFromOtp] = useGetAuthTokensFromOtpMutation();
  const { setAuthTokens } = useAuth();
  const { t } = useLingui();
  const { createWorkspace } = useSignUpInNewWorkspace();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();

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

    await getAuthTokensFromOTP(
      values.otp,
      loginToken,
      captchaToken
    )

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
          <Trans>
            Copy paste the code below
          </Trans>
        </StyledTextContainer>
      <StyledMainContentContainer>
      {/* // eslint-disable-next-line react/jsx-props-no-spreading */}
        <Controller
          name="otp"
          control={form.control}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <OTPInput
              maxLength={6}
              onBlur={onBlur}
              onChange={onChange}
              value={value}
              render={({ slots }) => (
                <OTPContainer>
                  <SlotGroup>
                    {slots.slice(0, 3).map((slot, idx) => (
                      <Slot key={idx} {...slot} />
                    ))}
                  </SlotGroup>

                  <FakeDash />

                  <SlotGroup>
                    {slots.slice(3).map((slot, idx) => (
                      <Slot key={idx} {...slot} />
                    ))}
                  </SlotGroup>
                </OTPContainer>
              )}
            />
          )}
        />
      </StyledMainContentContainer>
      <MainButton
        title={'Submit'}
        type='submit'
        variant={'primary'}
        fullWidth
      />
    </StyledForm>
  );
};
