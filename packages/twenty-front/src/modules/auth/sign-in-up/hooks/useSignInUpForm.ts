import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import { z } from 'zod';

import { PASSWORD_REGEX } from '@/auth/utils/passwordRegex';
import { isDeveloperDefaultSignInPrefilledState } from '@/client-config/states/isDeveloperDefaultSignInPrefilledState';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from '~/utils/isDefined';

export const validationSchema = z
  .object({
    exist: z.boolean(),
    email: z.string().trim().email('Email must be a valid email'),
    password: z
      .string()
      .regex(PASSWORD_REGEX, 'Password must contain at least 8 characters'),
    captchaToken: z.string().default(''),
  })
  .required();

export type Form = z.infer<typeof validationSchema>;
export const useSignInUpForm = () => {
  const isDeveloperDefaultSignInPrefilled = useRecoilValue(
    isDeveloperDefaultSignInPrefilledState,
  );
  const [searchParams] = useSearchParams();
  const invitationPrefilledEmail = searchParams.get('email');

  const form = useForm<Form>({
    mode: 'onChange',
    defaultValues: {
      exist: false,
      email: '',
      password: '',
      captchaToken: '',
    },
    resolver: zodResolver(validationSchema),
  });

  useEffect(() => {
    if (isDefined(invitationPrefilledEmail)) {
      form.setValue('email', invitationPrefilledEmail);
    } else if (isDeveloperDefaultSignInPrefilled === true) {
      form.setValue('email', 'tim@apple.dev');
      form.setValue('password', 'Applecar2025');
    }
  }, [form, isDeveloperDefaultSignInPrefilled, invitationPrefilledEmail]);
  return { form: form };
};
