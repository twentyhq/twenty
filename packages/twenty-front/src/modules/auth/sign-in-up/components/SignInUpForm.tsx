import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';
import { IconGoogle, IconMicrosoft } from 'twenty-ui';

import { FooterNote } from '@/auth/sign-in-up/components/FooterNote';
import { HorizontalSeparator } from '@/auth/sign-in-up/components/HorizontalSeparator';
import { useHandleResetPassword } from '@/auth/sign-in-up/hooks/useHandleResetPassword';
import {
  SignInUpMode,
  SignInUpStep,
  useSignInUp,
} from '@/auth/sign-in-up/hooks/useSignInUp';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { useSignInWithGoogle } from '@/auth/sign-in-up/hooks/useSignInWithGoogle';
import { useSignInWithMicrosoft } from '@/auth/sign-in-up/hooks/useSignInWithMicrosoft';
import { isRequestingCaptchaTokenState } from '@/captcha/states/isRequestingCaptchaTokenState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { captchaProviderState } from '@/client-config/states/captchaProviderState';
import { Loader } from '@/ui/feedback/loader/components/Loader';
import { MainButton } from '@/ui/input/button/components/MainButton';
import { TextInput } from '@/ui/input/components/TextInput';
import { ActionLink } from '@/ui/navigation/link/components/ActionLink';
import { isDefined } from '~/utils/isDefined';

const StyledContentContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledForm = styled.form`
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledFullWidthMotionDiv = styled(motion.div)`
  width: 100%;
`;

const StyledInputContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

export const SignInUpForm = () => {
  const captchaProvider = useRecoilValue(captchaProviderState);
  const isRequestingCaptchaToken = useRecoilValue(
    isRequestingCaptchaTokenState,
  );
  const [authProviders] = useRecoilState(authProvidersState);
  const [showErrors, setShowErrors] = useState(false);
  const { signInWithGoogle } = useSignInWithGoogle();
  const { signInWithMicrosoft } = useSignInWithMicrosoft();
  const { form } = useSignInUpForm();
  const { handleResetPassword } = useHandleResetPassword();

  const {
    signInUpStep,
    signInUpMode,
    continueWithCredentials,
    continueWithEmail,
    submitCredentials,
  } = useSignInUp(form);

  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === Key.Enter) {
      event.preventDefault();

      if (signInUpStep === SignInUpStep.Init) {
        continueWithEmail();
      } else if (signInUpStep === SignInUpStep.Email) {
        if (isDefined(form?.formState?.errors?.email)) {
          setShowErrors(true);
          return;
        }
        continueWithCredentials();
      } else if (signInUpStep === SignInUpStep.Password) {
        if (!form.formState.isSubmitting) {
          setShowErrors(true);
          form.handleSubmit(submitCredentials)();
        }
      }
    }
  };

  const buttonTitle = useMemo(() => {
    if (signInUpStep === SignInUpStep.Init) {
      return 'Continue With Email';
    }

    if (signInUpStep === SignInUpStep.Email) {
      return 'Continue';
    }

    return signInUpMode === SignInUpMode.SignIn ? 'Sign in' : 'Sign up';
  }, [signInUpMode, signInUpStep]);

  const theme = useTheme();

  const shouldWaitForCaptchaToken =
    signInUpStep !== SignInUpStep.Init &&
    isDefined(captchaProvider?.provider) &&
    isRequestingCaptchaToken;

  const isEmailStepSubmitButtonDisabledCondition =
    signInUpStep === SignInUpStep.Email &&
    (form.watch('email')?.length === 0 || shouldWaitForCaptchaToken);

  // TODO: isValid is actually a proxy function. If it is not rendered the first time, react might not trigger re-renders
  // We make the isValid check synchronous and update a reactState to make sure this does not happen
  const isPasswordStepSubmitButtonDisabledCondition =
    signInUpStep === SignInUpStep.Password &&
    (!form.formState.isValid ||
      form.formState.isSubmitting ||
      shouldWaitForCaptchaToken);

  const isSubmitButtonDisabled =
    isEmailStepSubmitButtonDisabledCondition ||
    isPasswordStepSubmitButtonDisabledCondition;

  return (
    <>
      <StyledContentContainer>
        {authProviders.google && (
          <>
            <MainButton
              Icon={() => <IconGoogle size={theme.icon.size.lg} />}
              title="Continue with Google"
              onClick={signInWithGoogle}
              fullWidth
            />
            <HorizontalSeparator visible={!authProviders.microsoft} />
          </>
        )}

        {authProviders.microsoft && (
          <>
            <MainButton
              Icon={() => <IconMicrosoft size={theme.icon.size.lg} />}
              title="Continue with Microsoft"
              onClick={signInWithMicrosoft}
              fullWidth
            />
            <HorizontalSeparator visible={authProviders.password} />
          </>
        )}

        {authProviders.password && (
          <StyledForm
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            {signInUpStep !== SignInUpStep.Init && (
              <StyledFullWidthMotionDiv
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{
                  type: 'spring',
                  stiffness: 800,
                  damping: 35,
                }}
              >
                <Controller
                  name="email"
                  control={form.control}
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => (
                    <StyledInputContainer>
                      <TextInput
                        autoFocus
                        value={value}
                        placeholder="Email"
                        onBlur={onBlur}
                        onChange={(value: string) => {
                          onChange(value);
                          if (signInUpStep === SignInUpStep.Password) {
                            continueWithEmail();
                          }
                        }}
                        error={showErrors ? error?.message : undefined}
                        fullWidth
                        disableHotkeys
                        onKeyDown={handleKeyDown}
                      />
                    </StyledInputContainer>
                  )}
                />
              </StyledFullWidthMotionDiv>
            )}
            {signInUpStep === SignInUpStep.Password && (
              <StyledFullWidthMotionDiv
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{
                  type: 'spring',
                  stiffness: 800,
                  damping: 35,
                }}
              >
                <Controller
                  name="password"
                  control={form.control}
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => (
                    <StyledInputContainer>
                      <TextInput
                        autoFocus
                        value={value}
                        type="password"
                        placeholder="Password"
                        onBlur={onBlur}
                        onChange={onChange}
                        error={showErrors ? error?.message : undefined}
                        fullWidth
                        disableHotkeys
                        onKeyDown={handleKeyDown}
                      />
                    </StyledInputContainer>
                  )}
                />
              </StyledFullWidthMotionDiv>
            )}
            <MainButton
              variant="secondary"
              title={buttonTitle}
              type="submit"
              onClick={async () => {
                if (signInUpStep === SignInUpStep.Init) {
                  continueWithEmail();
                  return;
                }
                if (signInUpStep === SignInUpStep.Email) {
                  if (isDefined(form?.formState?.errors?.email)) {
                    setShowErrors(true);
                    return;
                  }
                  continueWithCredentials();
                  return;
                }
                setShowErrors(true);
                form.handleSubmit(submitCredentials)();
              }}
              Icon={() => form.formState.isSubmitting && <Loader />}
              disabled={isSubmitButtonDisabled}
              fullWidth
            />
          </StyledForm>
        )}
      </StyledContentContainer>
      {signInUpStep === SignInUpStep.Password && (
        <ActionLink onClick={handleResetPassword(form.getValues('email'))}>
          Forgot your password?
        </ActionLink>
      )}
      {signInUpStep === SignInUpStep.Init && (
        <FooterNote>
          By using Twenty, you agree to the{' '}
          <a
            href="https://twenty.com/legal/terms"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="https://twenty.com/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
          .
        </FooterNote>
      )}
    </>
  );
};
