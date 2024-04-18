import { useEffect, useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useRecoilState } from 'recoil';
import { IconGoogle } from 'twenty-ui';

import { useHandleResetPassword } from '@/auth/sign-in-up/hooks/useHandleResetPassword.ts';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm.ts';
import { useSignInWithGoogle } from '@/auth/sign-in-up/hooks/useSignInWithGoogle.ts';
import { useWorkspaceFromInviteHash } from '@/auth/sign-in-up/hooks/useWorkspaceFromInviteHash.ts';
import { authProvidersState } from '@/client-config/states/authProvidersState.ts';
import { Loader } from '@/ui/feedback/loader/components/Loader';
import { MainButton } from '@/ui/input/button/components/MainButton';
import { TextInput } from '@/ui/input/components/TextInput';
import { ActionLink } from '@/ui/navigation/link/components/ActionLink.tsx';
import { AnimatedEaseIn } from '@/ui/utilities/animation/components/AnimatedEaseIn';

import { Logo } from '../../components/Logo';
import { Title } from '../../components/Title';
import { SignInUpMode, SignInUpStep, useSignInUp } from '../hooks/useSignInUp';

import { FooterNote } from './FooterNote';
import { HorizontalSeparator } from './HorizontalSeparator';

const StyledContentContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  width: 200px;
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
  const [authProviders] = useRecoilState(authProvidersState);
  const [showErrors, setShowErrors] = useState(false);
  const { handleResetPassword } = useHandleResetPassword();
  const workspace = useWorkspaceFromInviteHash();
  const { signInWithGoogle } = useSignInWithGoogle();
  const { form } = useSignInUpForm();

  const {
    isInviteMode,
    signInUpStep,
    signInUpMode,
    continueWithCredentials,
    continueWithEmail,
    submitCredentials,
    isGeneratingCaptchaToken,
    getCaptchaToken,
  } = useSignInUp(form);

  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      if (signInUpStep === SignInUpStep.Init) {
        continueWithEmail();
      } else if (signInUpStep === SignInUpStep.Email) {
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

  const title = useMemo(() => {
    if (isInviteMode) {
      return `Join ${workspace?.displayName ?? ''} team`;
    }

    if (
      signInUpStep === SignInUpStep.Init ||
      signInUpStep === SignInUpStep.Email
    ) {
      return 'Welcome to Twenty';
    }

    return signInUpMode === SignInUpMode.SignIn
      ? 'Sign in to Twenty'
      : 'Sign up to Twenty';
  }, [signInUpMode, workspace?.displayName, isInviteMode, signInUpStep]);

  const theme = useTheme();

  useEffect(() => {
    getCaptchaToken();
  }, [getCaptchaToken]);

  return (
    <>
      <AnimatedEaseIn>
        <Logo workspaceLogo={workspace?.logo} />
      </AnimatedEaseIn>
      <Title animate>{title}</Title>
      <StyledContentContainer>
        {authProviders.google && (
          <>
            <MainButton
              Icon={() => <IconGoogle size={theme.icon.size.lg} />}
              title="Continue with Google"
              onClick={signInWithGoogle}
              fullWidth
            />
            <HorizontalSeparator />
          </>
        )}

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

          <div id="captcha-widget" data-size="invisible"></div>
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
                continueWithCredentials();
                return;
              }
              setShowErrors(true);

              form.handleSubmit(submitCredentials)();
            }}
            Icon={() => form.formState.isSubmitting && <Loader />}
            disabled={
              signInUpStep === SignInUpStep.Init
                ? false
                : signInUpStep === SignInUpStep.Email
                  ? !form.watch('email')
                  : !form.watch('email') ||
                    !form.watch('password') ||
                    form.formState.isSubmitting
            }
            fullWidth
          />
        </StyledForm>
      </StyledContentContainer>
      {signInUpStep === SignInUpStep.Password && (
        <ActionLink onClick={handleResetPassword(form.getValues('email'))}>
          Forgot your password?
        </ActionLink>
      )}
      {signInUpStep === SignInUpStep.Init && (
        <FooterNote>
          By using Twenty, you agree to the Terms of Service and Privacy Policy.
        </FooterNote>
      )}
    </>
  );
};
