import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import { z } from 'zod';
import { useLocation } from 'react-router-dom';

import { PASSWORD_REGEX } from '@/auth/utils/passwordRegex';
import { isSignInPrefilledState } from '@/client-config/states/isSignInPrefilledState';
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
  const location = useLocation();
  const isSignInPrefilled = useRecoilValue(isSignInPrefilledState);
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
    const searchParams = new URLSearchParams(location.search);
    const email = searchParams.get('email');
    if (isDefined(email)) {
      form.setValue('email', email);
    } else if (isSignInPrefilled === true) {
      form.setValue('email', 'tim@apple.dev');
      form.setValue('password', 'Applecar2025');
    }
  }, [form, isSignInPrefilled, location.search]);
  return { form: form };
};
