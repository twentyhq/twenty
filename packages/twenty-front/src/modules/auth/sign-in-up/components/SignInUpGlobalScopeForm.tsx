import styled from '@emotion/styled';
import {
  IconGoogle,
  IconMicrosoft,
  Loader,
  MainButton,
  HorizontalSeparator,
} from 'twenty-ui';
import { useTheme } from '@emotion/react';
import { useSignInWithGoogle } from '@/auth/sign-in-up/hooks/useSignInWithGoogle';
import { useSignInWithMicrosoft } from '@/auth/sign-in-up/hooks/useSignInWithMicrosoft';
import { FormProvider } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useLocation } from 'react-router-dom';

import { isDefined } from '~/utils/isDefined';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { SignInUpEmailField } from '@/auth/sign-in-up/components/SignInUpEmailField';
import { SignInUpPasswordField } from '@/auth/sign-in-up/components/SignInUpPasswordField';
import { useAuth } from '@/auth/hooks/useAuth';
import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';
import { signInUpModeState } from '@/auth/states/signInUpModeState';
import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';
import { SignInUpMode } from '@/auth/types/signInUpMode';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';

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
  const theme = useTheme();
  const signInUpStep = useRecoilValue(signInUpStepState);

  const { signInWithGoogle } = useSignInWithGoogle();
  const { signInWithMicrosoft } = useSignInWithMicrosoft();
  const { checkUserExists } = useAuth();
  const { readCaptchaToken } = useReadCaptchaToken();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const setSignInUpStep = useSetRecoilState(signInUpStepState);
  const [signInUpMode, setSignInUpMode] = useRecoilState(signInUpModeState);

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
        if (data.checkUserExists.__typename === 'UserExists') {
          if (
            isDefined(data?.checkUserExists.availableWorkspaces) &&
            data.checkUserExists.availableWorkspaces.length >= 1
          ) {
            return redirectToWorkspaceDomain(
              data?.checkUserExists.availableWorkspaces[0].subdomain,
              pathname,
              {
                email: form.getValues('email'),
              },
            );
          }
        }
        if (data.checkUserExists.__typename === 'UserNotExists') {
          setSignInUpMode(SignInUpMode.SignUp);
          setSignInUpStep(SignInUpStep.Password);
        }
      },
    });
  };

  return (
    <>
      <StyledContentContainer>
        <MainButton
          Icon={() => <IconGoogle size={theme.icon.size.lg} />}
          title="Continue with Google"
          onClick={signInWithGoogle}
          fullWidth
        />
        <HorizontalSeparator visible={false} />
        <MainButton
          Icon={() => <IconMicrosoft size={theme.icon.size.lg} />}
          title="Continue with Microsoft"
          onClick={signInWithMicrosoft}
          fullWidth
        />
        <HorizontalSeparator visible={false} />
        <HorizontalSeparator visible />
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <FormProvider {...form}>
          <StyledForm onSubmit={form.handleSubmit(handleSubmit)}>
            <SignInUpEmailField showErrors={showErrors} />
            {signInUpStep === SignInUpStep.Password && (
              <SignInUpPasswordField
                showErrors={showErrors}
                signInUpMode={signInUpMode}
              />
            )}

            <MainButton
              title={
                signInUpStep === SignInUpStep.Password ? 'Sign Up' : 'Continue'
              }
              type="submit"
              variant="secondary"
              Icon={() => (form.formState.isSubmitting ? <Loader /> : null)}
              fullWidth
            />
          </StyledForm>
        </FormProvider>
      </StyledContentContainer>
    </>
  );
};
