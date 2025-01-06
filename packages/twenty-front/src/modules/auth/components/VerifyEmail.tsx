import { useAuth } from '@/auth/hooks/useAuth';
import { EmailVerificationStatus } from '@/auth/sign-in-up/components/EmailVerificationStatus';
import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

import { useEffect, useState } from 'react';
import { Navigate, redirect, useSearchParams } from 'react-router-dom';

export const VerifyEmail = () => {
  const {
    verifyEmail: { handleVerifyEmail, loading },
  } = useAuth();
  const { enqueueSnackBar } = useSnackBar();

  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const emailVerificationToken = searchParams.get('emailVerificationToken');

  useEffect(() => {
    const verifyEmailToken = async () => {
      if (!email || !emailVerificationToken) {
        return redirect(AppPath.SignInUp);
      }

      try {
        await handleVerifyEmail(emailVerificationToken);
        setIsEmailVerified(true);
      } catch (error) {
        enqueueSnackBar('Email verification failed. Please try again.', {
          variant: SnackBarVariant.Error,
        });
      }
    };

    verifyEmailToken();

    // Verify email only needs to run once at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!email || !emailVerificationToken) {
    return <Navigate to={AppPath.SignInUp} />;
  }

  if (loading) {
    return <></>;
  }

  return (
    <EmailVerificationStatus email={email} isEmailVerified={isEmailVerified} />
  );
};
