import { useCallback, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRecoilState, useRecoilValue } from 'recoil';
import { z } from 'zod';

import { authProvidersState } from '@/client-config/states/authProvidersState';
import { isSignInPrefilledState } from '@/client-config/states/isSignInPrefilledState';
import { AppPath } from '@/types/AppPath';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { useSnackBar } from '@/ui/feedback/snack-bar/hooks/useSnackBar';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useGetWorkspaceFromInviteHashQuery } from '~/generated/graphql';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

import { useAuth } from '../../hooks/useAuth';
import { PASSWORD_REGEX } from '../../utils/passwordRegex';

export enum SignInUpMode {
  SignIn = 'sign-in',
  SignUp = 'sign-up',
  Invite = 'invite',
}

export enum SignInUpStep {
  Init = 'init',
  Email = 'email',
  Password = 'password',
}

const validationSchema = z
  .object({
    exist: z.boolean(),
    email: z.string().email('Email must be a valid email'),
    password: z
      .string()
      .regex(PASSWORD_REGEX, 'Password must contain at least 8 characters'),
  })
  .required();

type Form = z.infer<typeof validationSchema>;

export const useSignInUp = () => {
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();
  const isMatchingLocation = useIsMatchingLocation();
  const [authProviders] = useRecoilState(authProvidersState);
  const isSignInPrefilled = useRecoilValue(isSignInPrefilledState);
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const [signInUpStep, setSignInUpStep] = useState<SignInUpStep>(
    SignInUpStep.Init,
  );
  const [signInUpMode, setSignInUpMode] = useState<SignInUpMode>(() => {
    if (isMatchingLocation(AppPath.Invite)) {
      return SignInUpMode.Invite;
    }

    return isMatchingLocation(AppPath.SignIn)
      ? SignInUpMode.SignIn
      : SignInUpMode.SignUp;
  });
  const [showErrors, setShowErrors] = useState(false);

  const { data: workspace } = useGetWorkspaceFromInviteHashQuery({
    variables: { inviteHash: workspaceInviteHash || '' },
  });

  const form = useForm<Form>({
    mode: 'onChange',
    defaultValues: {
      exist: false,
    },
    resolver: zodResolver(validationSchema),
  });

  useEffect(() => {
    if (isSignInPrefilled) {
      form.setValue('email', 'tim@apple.dev');
      form.setValue('password', 'Applecar2025');
    }
  }, [form, isSignInPrefilled]);

  const {
    signInWithCredentials,
    signUpWithCredentials,
    signInWithGoogle,
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
        let user;
        if (signInUpMode === SignInUpMode.SignIn) {
          user = await signInWithCredentials(data.email, data.password);
        } else {
          user = await signUpWithCredentials(
            data.email,
            data.password,
            workspaceInviteHash,
          );
        }
        if (user?.workspaceMember?.workspace?.displayName) {
          navigate('/');
        } else {
          navigate('/create/workspace');
        }
      } catch (err: any) {
        enqueueSnackBar(err?.message, {
          variant: 'error',
        });
      }
    },
    [
      navigate,
      signInWithCredentials,
      signUpWithCredentials,
      workspaceInviteHash,
      enqueueSnackBar,
      signInUpMode,
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
    signInWithGoogle: () => signInWithGoogle(workspaceInviteHash),
    signInUpStep,
    signInUpMode,
    showErrors,
    setShowErrors,
    continueWithCredentials,
    continueWithEmail,
    goBackToEmailStep,
    submitCredentials,
    form,
    workspace: workspace?.findWorkspaceFromInviteHash,
  };
};
