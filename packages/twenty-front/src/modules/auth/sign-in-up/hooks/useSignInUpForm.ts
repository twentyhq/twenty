import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { signInUpModeState } from '@/auth/states/signInUpModeState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { SignInUpMode } from '@/auth/types/signInUpMode';
import { PASSWORD_REGEX } from '@/auth/utils/passwordRegex';
import { isDeveloperDefaultSignInPrefilledState } from '@/client-config/states/isDeveloperDefaultSignInPrefilledState';
import { isDefined } from 'twenty-shared/utils';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const makePasswordSchema = (
  signInUpStep: SignInUpStep,
  signInUpMode: SignInUpMode,
) => {
  if (signInUpStep !== SignInUpStep.Password) {
    return z.string().optional();
  }

  // Existing hashes can exceed the write-path cap; only require a value to sign in
  if (signInUpMode === SignInUpMode.SignIn) {
    return z.string().min(1);
  }

  return z
    .string()
    .regex(PASSWORD_REGEX, t`Password must be between 8 and 50 characters`);
};

const makeValidationSchema = (
  signInUpStep: SignInUpStep,
  signInUpMode: SignInUpMode,
) =>
  z
    .object({
      exist: z.boolean(),
      email: z
        .string()
        .trim()
        .pipe(z.email({ error: t`Email must be a valid email` })),
      password: makePasswordSchema(signInUpStep, signInUpMode),
      captchaToken: z.string().default(''),
    })
    .required();

export type Form = z.infer<ReturnType<typeof makeValidationSchema>>;
export const useSignInUpForm = () => {
  const signInUpStep = useAtomStateValue(signInUpStepState);
  const signInUpMode = useAtomStateValue(signInUpModeState);

  const validationSchema = makeValidationSchema(signInUpStep, signInUpMode);

  const isDeveloperDefaultSignInPrefilled = useAtomStateValue(
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
    }

    if (isDeveloperDefaultSignInPrefilled === true) {
      form.setValue('email', prefilledEmail ?? 'tim@apple.dev');
      form.setValue('password', 'tim@apple.dev');
    }
  }, [form, isDeveloperDefaultSignInPrefilled, prefilledEmail]);
  return { form };
};
