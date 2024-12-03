import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import { z } from 'zod';
import { useLocation } from 'react-router-dom';

import { PASSWORD_REGEX } from '@/auth/utils/passwordRegex';
import { isDeveloperDefaultSignInPrefilledState } from '@/client-config/states/isDeveloperDefaultSignInPrefilledState';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from '~/utils/isDefined';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';

const makeValidationSchema = (signInUpStep: SignInUpStep) =>
  z
    .object({
      exist: z.boolean(),
      email: z.string().trim().email('Email must be a valid email'),
      password:
        signInUpStep === SignInUpStep.Password
          ? z
              .string()
              .regex(
                PASSWORD_REGEX,
                'Password must contain at least 8 characters',
              )
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
  const [searchParams] = useSearchParams();
  const prefilledEmail = searchParams.get('email');

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
    } else if (isDeveloperDefaultSignInPrefilled === true) {
      form.setValue('email', 'tim@apple.dev');
      form.setValue('password', 'Applecar2025');
    }
  }, [form, isDeveloperDefaultSignInPrefilled, prefilledEmail, location.search]);
  return { form: form };
};
