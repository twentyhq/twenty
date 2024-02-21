import { useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useRecoilState } from 'recoil';

import { useHandleResetPassword } from '@/auth/sign-in-up/hooks/useHandleResetPassword.ts';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm.ts';
import { useSignInWithGoogle } from '@/auth/sign-in-up/hooks/useSignInWithGoogle.ts';
import { useWorkspaceFromInviteHash } from '@/auth/sign-in-up/hooks/useWorkspaceFromInviteHash.ts';
import { authProvidersState } from '@/client-config/states/authProvidersState.ts';
import { IconGoogle } from '@/ui/display/icon/components/IconGoogle';
import useI18n from '@/ui/i18n/useI18n';
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

const StyledFooterNote = styled(FooterNote)`
  max-width: 280px;
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

  const { translate } = useI18n('translations');
  const {
    signInUpStep,
    signInUpMode,
    continueWithCredentials,
    continueWithEmail,
    submitCredentials,
  } = useSignInUp(form);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      if (signInUpStep === SignInUpStep.Init) {
        continueWithEmail();
      } else if (signInUpStep === SignInUpStep.Email) {
        continueWithCredentials();
      } else if (signInUpStep === SignInUpStep.Password) {
        setShowErrors(true);
        form.handleSubmit(submitCredentials)();
      }
    }
  };

  const buttonTitle = useMemo(() => {
    if (signInUpStep === SignInUpStep.Init) {
      return translate('continueWithEmail');
    }

    if (signInUpStep === SignInUpStep.Email) {
      return translate('continue');
    }

    return signInUpMode === SignInUpMode.SignIn
      ? translate('signIn')
      : form.formState.isSubmitting
        ? translate('creatingWorkspace')
        : translate('signUp');
  }, [signInUpMode, signInUpStep, form.formState.isSubmitting]);

  const title = useMemo(() => {
    if (signInUpMode === SignInUpMode.Invite) {
      return translate('joinTeam', {
        displayName: workspace?.displayName ?? '',
      });
    }

    return signInUpMode === SignInUpMode.SignIn
      ? translate('signInToCrm')
      : translate('signUpToCrm');
  }, [signInUpMode, workspace?.displayName, translate]);

  const theme = useTheme();

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
              title={translate('continueWithGoogle')}
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
                      placeholder={translate('email')}
                      onBlur={onBlur}
                      onChange={(value: string) => {
                        onChange(value);
                        if (signInUpStep === SignInUpStep.Password) {
                          continueWithEmail();
                        }
                      }}
                      error={showErrors ? error?.message : undefined}
                      onKeyDown={handleKeyDown}
                      fullWidth
                      disableHotkeys
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
                      placeholder={translate('password')}
                      onBlur={onBlur}
                      onChange={onChange}
                      onKeyDown={handleKeyDown}
                      error={showErrors ? error?.message : undefined}
                      fullWidth
                      disableHotkeys
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
            onClick={() => {
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
              SignInUpStep.Init
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
      {signInUpStep === SignInUpStep.Password ? (
        <ActionLink onClick={handleResetPassword(form.getValues('email'))}>
          {translate('forgotYourPassword')}
        </ActionLink>
      ) : (
        <StyledFooterNote>
          {translate('footerNote')}
        </StyledFooterNote>
      )}
    </>
  );
};
