import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { HorizontalSeparator, Loader, MainButton } from 'twenty-ui';

import { useAuth } from '@/auth/hooks/useAuth';
import { SignInUpEmailField } from '@/auth/sign-in-up/components/SignInUpEmailField';
import { SignInUpPasswordField } from '@/auth/sign-in-up/components/SignInUpPasswordField';
import { SignInUpWithGoogle } from '@/auth/sign-in-up/components/SignInUpWithGoogle';
import { SignInUpWithMicrosoft } from '@/auth/sign-in-up/components/SignInUpWithMicrosoft';
import { useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { signInUpModeState } from '@/auth/states/signInUpModeState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { SignInUpMode } from '@/auth/types/signInUpMode';
import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';
import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';
import { isRequestingCaptchaTokenState } from '@/captcha/states/isRequestingCaptchaTokenState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { isDefined } from 'twenty-shared';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';

const StyledContentContainer = styled(motion.div)`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledForm = styled.form`
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const SignInUpGlobalScopeForm = () => {
  const authProviders = useRecoilValue(authProvidersState);
  const signInUpStep = useRecoilValue(signInUpStepState);

  const { checkUserExists } = useAuth();
  const { readCaptchaToken } = useReadCaptchaToken();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const setSignInUpStep = useSetRecoilState(signInUpStepState);
  const [signInUpMode, setSignInUpMode] = useRecoilState(signInUpModeState);

  const isRequestingCaptchaToken = useRecoilValue(
    isRequestingCaptchaTokenState,
  );

  const { enqueueSnackBar } = useSnackBar();
  const { requestFreshCaptchaToken } = useRequestFreshCaptchaToken();

  const [showErrors, setShowErrors] = useState(false);

  const { form } = useSignInUpForm();
  const { pathname } = useLocation();

  const { submitCredentials } = useSignInUp(form);

  const handleSubmit = async () => {
    if (isDefined(form?.formState?.errors?.email)) {
      setShowErrors(true);
      return;
    }

    if (signInUpStep === SignInUpStep.Password) {
      await submitCredentials(form.getValues());
      return;
    }

    const token = await readCaptchaToken();
    await checkUserExists.checkUserExistsQuery({
      variables: {
        email: form.getValues('email'),
        captchaToken: token,
      },
      onError: (error) => {
        enqueueSnackBar(`${error.message}`, {
          variant: SnackBarVariant.Error,
        });
      },
      onCompleted: (data) => {
        requestFreshCaptchaToken();
        const response = data.checkUserExists;
        if (response.__typename === 'UserExists') {
          if (response.availableWorkspaces.length >= 1) {
            const workspace = response.availableWorkspaces[0];
            return redirectToWorkspaceDomain(
              getWorkspaceUrl(workspace.workspaceUrls),
              pathname,
              {
                email: form.getValues('email'),
              },
            );
          }
        }
        if (response.__typename === 'UserNotExists') {
          setSignInUpMode(SignInUpMode.SignUp);
          setSignInUpStep(SignInUpStep.Password);
        }
      },
    });
  };

  const onEmailChange = (email: string) => {
    if (email !== form.getValues('email')) {
      setSignInUpStep(SignInUpStep.Email);
    }
  };

  return (
    <>
      <StyledContentContainer>
        {authProviders.google && <SignInUpWithGoogle />}
        {authProviders.microsoft && <SignInUpWithMicrosoft />}
        {(authProviders.google || authProviders.microsoft) && (
          <HorizontalSeparator />
        )}
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <FormProvider {...form}>
          <StyledForm onSubmit={form.handleSubmit(handleSubmit)}>
            <SignInUpEmailField
              showErrors={showErrors}
              onInputChange={onEmailChange}
            />
            {signInUpStep === SignInUpStep.Password && (
              <SignInUpPasswordField
                showErrors={showErrors}
                signInUpMode={signInUpMode}
              />
            )}
            <MainButton
              disabled={isRequestingCaptchaToken}
              title={
                signInUpStep === SignInUpStep.Password ? 'Sign Up' : 'Continue'
              }
              type="submit"
              variant={
                signInUpStep === SignInUpStep.Init ? 'secondary' : 'primary'
              }
              Icon={() => (form.formState.isSubmitting ? <Loader /> : null)}
              fullWidth
            />
          </StyledForm>
        </FormProvider>
      </StyledContentContainer>
    </>
  );
};
