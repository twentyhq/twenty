import { useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import { IconGoogle } from '@/ui/display/icon/components/IconGoogle';
import useI18n from '@/ui/i18n/useI18n';
import { MainButton } from '@/ui/input/button/components/MainButton';
import { TextInput } from '@/ui/input/components/TextInput';
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
  const { translate } = useI18n('translations');
  const {
    authProviders,
    signInWithGoogle,
    signInUpStep,
    signInUpMode,
    showErrors,
    setShowErrors,
    continueWithCredentials,
    continueWithEmail,
    submitCredentials,
    form: {
      control,
      watch,
      handleSubmit,
      formState: { isSubmitting },
    },
    workspace,
  } = useSignInUp();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      if (signInUpStep === SignInUpStep.Init) {
        continueWithEmail();
      } else if (signInUpStep === SignInUpStep.Email) {
        continueWithCredentials();
      } else if (signInUpStep === SignInUpStep.Password) {
        setShowErrors(true);
        handleSubmit(submitCredentials)();
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
      : translate('signUp');
  }, [signInUpMode, signInUpStep]);

  const title = useMemo(() => {
    if (signInUpMode === SignInUpMode.Invite) {
      return translate('joinTeam', {
        displayName: workspace?.displayName ?? '',
      });
    }

    return signInUpMode === SignInUpMode.SignIn
      ? translate('signInToCrm')
      : translate('signUpToCrm');
  }, [signInUpMode, workspace?.displayName]);

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
                control={control}
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
                control={control}
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
              handleSubmit(submitCredentials)();
            }}
            disabled={
              SignInUpStep.Init
                ? false
                : signInUpStep === SignInUpStep.Email
                  ? !watch('email')
                  : !watch('email') || !watch('password') || isSubmitting
            }
            fullWidth
          />
        </StyledForm>
      </StyledContentContainer>
      <StyledFooterNote>{translate('footerNote')}</StyledFooterNote>
    </>
  );
};
