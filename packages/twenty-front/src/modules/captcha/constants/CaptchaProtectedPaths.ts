import { AppPath } from 'twenty-shared/types';

export const CAPTCHA_PROTECTED_PATHS: string[] = [
  AppPath.SignInUp,
  AppPath.SignInUpV2,
  AppPath.Verify,
  AppPath.VerifyV2,
  AppPath.VerifyEmail,
  AppPath.ResetPassword,
  AppPath.Invite,
];
