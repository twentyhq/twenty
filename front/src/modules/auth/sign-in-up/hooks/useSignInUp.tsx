import { useCallback, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRecoilState, useRecoilValue } from 'recoil';
import * as Yup from 'yup';

import { authProvidersState } from '@/client-config/states/authProvidersState';
import { isDemoModeState } from '@/client-config/states/isDemoModeState';
import { useSnackBar } from '@/ui/snack-bar/hooks/useSnackBar';

import { PageHotkeyScope } from '../../../types/PageHotkeyScope';
import { useScopedHotkeys } from '../../../ui/hotkey/hooks/useScopedHotkeys';
import { useAuth } from '../../hooks/useAuth';
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

export function useSignInUp() {
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();
  const [authProviders] = useRecoilState(authProvidersState);
  const isDemoMode = useRecoilValue(isDemoModeState);
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const [signInUpStep, setSignInUpStep] = useState<SignInUpStep>(
    SignInUpStep.Init,
  );
  const [signInUpMode, setSignInUpMode] = useState<SignInUpMode>(
    SignInUpMode.SignIn,
  );
  const [showErrors, setShowErrors] = useState(false);

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
      },
    });
    setSignInUpStep(SignInUpStep.Email);
  }, [setSignInUpStep, setSignInUpMode, checkUserExistsQuery, form]);

  const continueWithCredentials = useCallback(() => {
    setSignInUpStep(SignInUpStep.Password);
  }, [setSignInUpStep]);

  const submitCredentials: SubmitHandler<Form> = useCallback(
    async (data) => {
      setShowErrors(true);

      try {
        if (!data.email || !data.password) {
          throw new Error('Email and password are required');
        }
        if (signInUpMode === SignInUpMode.SignIn) {
          await credentialsSignIn(data.email, data.password);
        } else {
          await credentialsSignUp(
            data.email,
            data.password,
            workspaceInviteHash,
          );
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
    ],
  );

  useScopedHotkeys(
    'enter',
    () => {
      if (signInUpStep === SignInUpStep.Init) {
        continueWithEmail();
      }

      if (signInUpStep === SignInUpStep.Email) {
        continueWithCredentials();
      }
    },
    PageHotkeyScope.SignInUp,
    [continueWithEmail],
  );

  return {
    authProviders,
    googleSignIn,
    signInUpStep,
    signInUpMode,
    showErrors,
    continueWithCredentials,
    continueWithEmail,
    submitCredentials,
    form,
  };
}
