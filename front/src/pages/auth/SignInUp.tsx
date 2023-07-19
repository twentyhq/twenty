import { useCallback, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { motion } from 'framer-motion';
import { useRecoilState, useRecoilValue } from 'recoil';
import * as Yup from 'yup';

import { FooterNote } from '@/auth/components/ui/FooterNote';
import { HorizontalSeparator } from '@/auth/components/ui/HorizontalSeparator';
import { Logo } from '@/auth/components/ui/Logo';
import { Title } from '@/auth/components/ui/Title';
import { useAuth } from '@/auth/hooks/useAuth';
import { PASSWORD_REGEX } from '@/auth/utils/passwordRegex';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { isDemoModeState } from '@/client-config/states/isDemoModeState';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { AnimatedEaseIn } from '@/ui/animation/components/AnimatedEaseIn';
import { MainButton } from '@/ui/button/components/MainButton';
import { useScopedHotkeys } from '@/ui/hotkey/hooks/useScopedHotkeys';
import { IconBrandGoogle } from '@/ui/icon';
import { TextInput } from '@/ui/input/components/TextInput';
import { useSnackBar } from '@/ui/snack-bar/hooks/useSnackBar';
import { useCheckUserExistsLazyQuery } from '~/generated/graphql';

const StyledContentContainer = styled.div`
  width: 200px;
  > * + * {
    margin-top: ${({ theme }) => theme.spacing(3)};
  }
`;

const StyledFooterNote = styled(FooterNote)`
  max-width: 283px;
`;

const StyledForm = styled.form`
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
  > * + * {
    margin-top: ${({ theme }) => theme.spacing(8)};
  }
`;

enum SignInUpMode {
  SignIn = 'sign-in',
  SignUp = 'sign-up',
}

enum SignInUpStep {
  Init = 'init',
  Email = 'email',
  Password = 'password',
}

const validationSchema = Yup.object()
  .shape({
    exist: Yup.boolean().required(),
    email: Yup.string().email('Email must be a valid email').required(),
    password: Yup.string()
      .matches(
        PASSWORD_REGEX,
        'Password must contain at least 8 characters, one uppercase and one number',
      )
      .required(),
  })
  .required();

type Form = Yup.InferType<typeof validationSchema>;

export function SignInUp() {
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();
  const theme = useTheme();
  const [authProviders] = useRecoilState(authProvidersState);
  const isDemoMode = useRecoilValue(isDemoModeState);
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const [checkUserExistsQuery, { data: checkUserExistsData }] =
    useCheckUserExistsLazyQuery();

  const [signInUpMode, setSignInUpMode] = useState<SignInUpMode>(
    SignInUpMode.SignIn,
  );

  const [signInUpStep, setSignInUpStep] = useState<SignInUpStep>(
    SignInUpStep.Init,
  );

  const [showErrors, setShowErrors] = useState(false);

  const onGoogleLoginClick = useCallback(() => {
    window.location.href = process.env.REACT_APP_AUTH_URL + '/google' || '';
  }, []);

  const { login, signUp } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
    getValues,
  } = useForm<Form>({
    mode: 'onChange',
    defaultValues: {
      exist: false,
      email: isDemoMode ? 'tim@apple.dev' : '',
      password: isDemoMode ? 'Applecar2025' : '',
    },
    resolver: yupResolver(validationSchema),
  });

  const onContinueWithEmailClick = useCallback(() => {
    checkUserExistsQuery({
      variables: {
        email: getValues('email'),
      },
    });
    setSignInUpStep(SignInUpStep.Email);
  }, [setSignInUpStep, checkUserExistsQuery, getValues]);

  const onContinueClick = useCallback(() => {
    setSignInUpStep(SignInUpStep.Password);
  }, [setSignInUpStep]);

  const onSubmit: SubmitHandler<Form> = useCallback(
    async (data) => {
      console.log('toto');

      setShowErrors(true);

      try {
        if (!data.email || !data.password) {
          throw new Error('Email and password are required');
        }
        if (checkUserExistsData?.checkUserExists.exists) {
          await login(data.email, data.password);
        } else {
          await signUp(data.email, data.password, workspaceInviteHash);
        }
        navigate('/create/workspace');
      } catch (err: any) {
        console.log('err', err);
        enqueueSnackBar(err?.message, {
          variant: 'error',
        });
      }
    },
    [
      checkUserExistsData?.checkUserExists.exists,
      navigate,
      login,
      signUp,
      workspaceInviteHash,
      enqueueSnackBar,
    ],
  );

  useScopedHotkeys(
    'enter',
    () => {
      if (signInUpStep === SignInUpStep.Init) {
        onContinueWithEmailClick();
      }

      if (signInUpStep === SignInUpStep.Email) {
        onContinueClick();
      }
    },
    PageHotkeyScope.SignInUp,
    [onContinueClick],
  );

  return (
    <>
      <AnimatedEaseIn>
        <Logo />
      </AnimatedEaseIn>
      <Title animate>Welcome to Twenty</Title>
      <StyledContentContainer>
        {authProviders.google && (
          <MainButton
            icon={<IconBrandGoogle size={theme.icon.size.sm} stroke={4} />}
            title="Continue with Google"
            onClick={onGoogleLoginClick}
            fullWidth
          />
        )}
        <HorizontalSeparator />

        <StyledForm
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          {signInUpStep !== SignInUpStep.Init && (
            <motion.div
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
                  <TextInput
                    value={value}
                    placeholder="Email"
                    onBlur={onBlur}
                    onChange={onChange}
                    error={showErrors ? error?.message : undefined}
                    fullWidth
                  />
                )}
              />
            </motion.div>
          )}
          {signInUpStep === SignInUpStep.Password && (
            <motion.div
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
                  <TextInput
                    value={value}
                    type="password"
                    placeholder="Password"
                    onBlur={onBlur}
                    onChange={onChange}
                    error={showErrors ? error?.message : undefined}
                    fullWidth
                  />
                )}
              />
            </motion.div>
          )}

          <MainButton
            variant="secondary"
            title="Continue"
            type="submit"
            onClick={() => {
              console.log(signInUpStep);
              if (signInUpStep === SignInUpStep.Init) {
                onContinueWithEmailClick();
                return;
              }
              if (signInUpStep === SignInUpStep.Email) {
                onContinueClick();
                return;
              }
              handleSubmit(onSubmit)();
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
      <StyledFooterNote>
        By using Twenty, you agree to the Terms of Service and Data Processing
        Agreement.
      </StyledFooterNote>
    </>
  );
}
