import { AppPath } from '@/types/AppPath';

export const CAPTCHA_PROTECTED_PATHS: string[] = [
  AppPath.SignInUp,
  AppPath.Verify,
  AppPath.VerifyEmail,
  AppPath.ResetPassword,
  AppPath.Invite,
];
