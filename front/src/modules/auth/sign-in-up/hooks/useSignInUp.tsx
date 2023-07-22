import { useCallback, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRecoilState, useRecoilValue } from 'recoil';
import * as Yup from 'yup';

import { authProvidersState } from '@/client-config/states/authProvidersState';
import { isDemoModeState } from '@/client-config/states/isDemoModeState';
import { AppPath } from '@/types/AppPath';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { useScopedHotkeys } from '@/ui/hotkey/hooks/useScopedHotkeys';
import { useSnackBar } from '@/ui/snack-bar/hooks/useSnackBar';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

import { useAuth } from '../../hooks/useAuth';
import { currentUserState } from '../../states/currentUserState';
import { PASSWORD_REGEX } from '../../utils/passwordRegex';

export enum SignInUpMode {
  SignIn = 'sign-in',
  SignUp = 'sign-up',
}

export enum SignInUpStep {
  Init = 'init',
  Email = 'email',
  Password = 'password',
}
const validationSchema = Yup.object()
  .shape({
    exist: Yup.boolean().required(),
    email: Yup.string()
      .email('Email must be a valid email')
      .required('Email must be a valid email'),
    password: Yup.string()
      .matches(PASSWORD_REGEX, 'Password must contain at least 8 characters')
      .required(),
  })
  .required();

type Form = Yup.InferType<typeof validationSchema>;

export function useSignInUp() {
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();
  const isMatchingLocation = useIsMatchingLocation();
  const [authProviders] = useRecoilState(authProvidersState);
  const isDemoMode = useRecoilValue(isDemoModeState);
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const [signInUpStep, setSignInUpStep] = useState<SignInUpStep>(
    SignInUpStep.Init,
  );
  const [signInUpMode, setSignInUpMode] = useState<SignInUpMode>(
    isMatchingLocation(AppPath.SignIn)
      ? SignInUpMode.SignIn
      : SignInUpMode.SignUp,
  );
  const [showErrors, setShowErrors] = useState(false);
  const [, setCurrentUser] = useRecoilState(currentUserState);

  const form = useForm<Form>({
    mode: 'onChange',
    defaultValues: {
      exist: false,
      email: isDemoMode ? 'tim@apple.dev' : '',
      password: isDemoMode ? 'Applecar2025' : '',
    },
    resolver: yupResolver(validationSchema),
  });

  const {
    credentialsSignIn,
    credentialsSignUp,
    googleSignIn,
    checkUserExists: { checkUserExistsQuery },
  } = useAuth();

  const continueWithEmail = useCallback(() => {
    setSignInUpStep(SignInUpStep.Email);
    setSignInUpMode(
      isMatchingLocation(AppPath.SignIn)
        ? SignInUpMode.SignIn
        : SignInUpMode.SignUp,
    );
  }, [setSignInUpStep, setSignInUpMode, isMatchingLocation]);

  const continueWithCredentials = useCallback(() => {
    checkUserExistsQuery({
      variables: {
        email: form.getValues('email'),
      },
      onCompleted: (data) => {
        if (data?.checkUserExists.exists) {
          setSignInUpMode(SignInUpMode.SignIn);
        } else {
          setSignInUpMode(SignInUpMode.SignUp);
        }
        setSignInUpStep(SignInUpStep.Password);
      },
    });
  }, [setSignInUpStep, checkUserExistsQuery, form, setSignInUpMode]);

  const submitCredentials: SubmitHandler<Form> = useCallback(
    async (data) => {
      try {
        if (!data.email || !data.password) {
          throw new Error('Email and password are required');
        }
        if (signInUpMode === SignInUpMode.SignIn) {
          const { user } = await credentialsSignIn(data.email, data.password);
          setCurrentUser(user);
        } else {
          const { user } = await credentialsSignUp(
            data.email,
            data.password,
            workspaceInviteHash,
          );
          setCurrentUser(user);
        }
        navigate('/create/workspace');
      } catch (err: any) {
        enqueueSnackBar(err?.message, {
          variant: 'error',
        });
      }
    },
    [
      navigate,
      credentialsSignIn,
      credentialsSignUp,
      workspaceInviteHash,
      enqueueSnackBar,
      signInUpMode,
      setCurrentUser,
    ],
  );

  const goBackToEmailStep = useCallback(() => {
    setSignInUpStep(SignInUpStep.Email);
  }, [setSignInUpStep]);

  useScopedHotkeys(
    'enter',
    () => {
      if (signInUpStep === SignInUpStep.Init) {
        continueWithEmail();
      }

      if (signInUpStep === SignInUpStep.Email) {
        continueWithCredentials();
      }

      if (signInUpStep === SignInUpStep.Password) {
        form.handleSubmit(submitCredentials)();
      }
    },
    PageHotkeyScope.SignInUp,
    [continueWithEmail],
  );

  return {
    authProviders,
    googleSignIn: () => googleSignIn(workspaceInviteHash),
    signInUpStep,
    signInUpMode,
    showErrors,
    setShowErrors,
    continueWithCredentials,
    continueWithEmail,
    goBackToEmailStep,
    submitCredentials,
    form,
  };
}
