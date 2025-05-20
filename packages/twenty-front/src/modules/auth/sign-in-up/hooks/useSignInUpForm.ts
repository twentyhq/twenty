import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { z } from 'zod';

import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { PASSWORD_REGEX } from '@/auth/utils/passwordRegex';
import { isDeveloperDefaultSignInPrefilledState } from '@/client-config/states/isDeveloperDefaultSignInPrefilledState';
import { isDefined } from 'twenty-shared/utils';
import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { useAuth } from '@/auth/hooks/useAuth';

const makeValidationSchema = (signInUpStep: SignInUpStep) =>
  z
    .object({
      exist: z.boolean(),
      email: z.string().trim().email('Email must be a valid email'),
      password:
        signInUpStep === SignInUpStep.Password
          ? z
              .string()
              .regex(PASSWORD_REGEX, 'Password must be min. 8 characters')
          : z.string().optional(),
      captchaToken: z.string().default(''),
    })
    .required();

export type Form = z.infer<ReturnType<typeof makeValidationSchema>>;
export const useSignInUpForm = () => {
  const location = useLocation();
  const [signInUpStep, setSignInUpStep] = useRecoilState(signInUpStepState);

  const { listAvailableWorkspacesQuery } = useAuth();

  const [availableWorkspaces, setAvailableWorkspaces] = useRecoilState(
    availableWorkspacesState,
  );

  const validationSchema = makeValidationSchema(signInUpStep); // Create schema based on the current step

  const isDeveloperDefaultSignInPrefilled = useRecoilValue(
    isDeveloperDefaultSignInPrefilledState,
  );
  const [searchParams] = useSearchParams();
  const prefilledEmail = searchParams.get('email');
  const emailForWorkspacesSelection = searchParams.get(
    'emailForWorkspacesSelection',
  );

  const form = useForm<Form>({
    mode: 'onSubmit',
    defaultValues: {
      exist: false,
      email: '',
      password: '',
      captchaToken: '',
    },
    resolver: zodResolver(validationSchema),
  });

  useEffect(() => {
    if (isDefined(prefilledEmail)) {
      form.setValue('email', prefilledEmail);
    }

    if (
      isDefined(emailForWorkspacesSelection) &&
      availableWorkspaces.length === 0
    ) {
      listAvailableWorkspacesQuery({
        variables: {
          email: emailForWorkspacesSelection,
        },
        onCompleted: (data) => {
          setAvailableWorkspaces(data.listAvailableWorkspaces);
        },
      });
      setSignInUpStep(SignInUpStep.WorkspaceSelection);
    }

    if (isDeveloperDefaultSignInPrefilled === true) {
      form.setValue('email', prefilledEmail ?? 'tim@apple.dev');
      form.setValue('password', 'tim@apple.dev');
    }
  }, [
    form,
    isDeveloperDefaultSignInPrefilled,
    prefilledEmail,
    location.search,
    emailForWorkspacesSelection,
    availableWorkspaces.length,
    listAvailableWorkspacesQuery,
    setSignInUpStep,
    setAvailableWorkspaces,
  ]);
  return { form: form };
};
