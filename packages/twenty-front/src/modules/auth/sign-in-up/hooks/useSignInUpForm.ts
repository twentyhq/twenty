import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { z } from 'zod';

import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { PASSWORD_REGEX } from '@/auth/utils/passwordRegex';
import { isDeveloperDefaultSignInPrefilledState } from '@/client-config/states/isDeveloperDefaultSignInPrefilledState';
import { isDefined } from 'twenty-shared/utils';

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
  const signInUpStep = useRecoilValue(signInUpStepState);

  const validationSchema = makeValidationSchema(signInUpStep); // Create schema based on the current step

  const isDeveloperDefaultSignInPrefilled = useRecoilValue(
    isDeveloperDefaultSignInPrefilledState,
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const prefilledEmail = searchParams.get('email');

  if (isDefined(prefilledEmail)) {
    // remove it after use it to prevent side effect
    searchParams.delete('email');
    setSearchParams(searchParams);
  }

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
      isDeveloperDefaultSignInPrefilled === true &&
      form.getValues('email') === ''
    ) {
      form.setValue('email', prefilledEmail ?? 'tim@apple.dev');
      form.setValue('password', 'Applecar2025');
    }
  }, [
    form,
    isDeveloperDefaultSignInPrefilled,
    prefilledEmail,
    location.search,
  ]);
  return { form: form };
};
