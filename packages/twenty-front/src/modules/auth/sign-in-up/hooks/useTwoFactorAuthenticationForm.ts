import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const otpValidationSchema = z.object({
  otp: z.string().trim().min(1, 'OTP is required')
})

export type OTPFormValues = z.infer<typeof otpValidationSchema>;
export const useTwoFactorAuthenticationForm = () => {
  const form = useForm<OTPFormValues>({
    mode: 'onSubmit',
    defaultValues: {
      otp: ''
    },
    resolver: zodResolver(otpValidationSchema),
  });

  return { form: form };
};
