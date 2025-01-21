import { useAuth } from '@/auth/hooks/useAuth';
import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { EmailVerificationSent } from '../sign-in-up/components/EmailVerificationSent';

export const VerifyEmailEffect = () => {
  const { getLoginTokenFromEmailVerificationToken } = useAuth();

  const { enqueueSnackBar } = useSnackBar();

  const [searchParams] = useSearchParams();
  const [isError, setIsError] = useState(false);
  const email = searchParams.get('email');
  const emailVerificationToken = searchParams.get('emailVerificationToken');

  const navigate = useNavigateApp();
  const { readCaptchaToken } = useReadCaptchaToken();

  useEffect(() => {
    const verifyEmailToken = async () => {
      if (!email || !emailVerificationToken) {
        enqueueSnackBar(`Invalid email verification link.`, {
          dedupeKey: 'email-verification-link-dedupe-key',
          variant: SnackBarVariant.Error,
        });
        return navigate(AppPath.SignInUp);
      }

      const captchaToken = await readCaptchaToken();

      try {
        const { loginToken } = await getLoginTokenFromEmailVerificationToken(
          emailVerificationToken,
          captchaToken,
        );

        enqueueSnackBar('Email verified.', {
          dedupeKey: 'email-verification-dedupe-key',
          variant: SnackBarVariant.Success,
        });

        navigate(AppPath.Verify, undefined, { loginToken: loginToken.token });
      } catch (error) {
        enqueueSnackBar('Email verification failed.', {
          dedupeKey: 'email-verification-dedupe-key',
          variant: SnackBarVariant.Error,
        });
        setIsError(true);
      }
    };

    verifyEmailToken();

    // Verify email only needs to run once at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isError) {
    return <EmailVerificationSent email={email} isError={true} />;
  }

  return <></>;
};
