import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const createOtpValidationSchema = () =>
  z.object({
    otp: z
      .string()
      .trim()
      .length(6, t`OTP must be exactly 6 digits`),
  });

export type OTPFormValues = z.infer<
  ReturnType<typeof createOtpValidationSchema>
>;
export const useTwoFactorAuthenticationForm = () => {
  const form = useForm<OTPFormValues>({
    mode: 'onSubmit',
    defaultValues: {
      otp: '',
    },
    resolver: zodResolver(createOtpValidationSchema()),
  });

  return { form };
};
