import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const otpValidationSchema = z.object({
  otp: z.string().trim().length(6, 'OTP must be exactly 6 digits'),
});

export type OTPFormValues = z.infer<typeof otpValidationSchema>;
export const useTwoFactorAuthenticationForm = () => {
  const form = useForm<OTPFormValues>({
    mode: 'onSubmit',
    defaultValues: {
      otp: '',
    },
    resolver: zodResolver(otpValidationSchema),
  });

  return { form };
};
