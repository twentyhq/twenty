import { useAuth } from '@/auth/hooks/useAuth';
import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

import { useEffect, useState } from 'react';
import { redirect, useNavigate, useSearchParams } from 'react-router-dom';
import { EmailVerificationSent } from '../sign-in-up/components/EmailVerificationSent';

export const VerifyEmailEffect = () => {
  const { verifyEmail } = useAuth();

  const { enqueueSnackBar } = useSnackBar();

  const [searchParams] = useSearchParams();
  const [isError, setIsError] = useState(false);
  const email = searchParams.get('email');
  const emailVerificationToken = searchParams.get('emailVerificationToken');

  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmailToken = async () => {
      if (!email || !emailVerificationToken) {
        return redirect(AppPath.SignInUp);
      }

      try {
        await verifyEmail(emailVerificationToken);

        enqueueSnackBar(
          'Email verification successful. Please sign in to continue.',
          {
            variant: SnackBarVariant.Success,
          },
        );

        navigate(`${AppPath.SignInUp}?email=${encodeURIComponent(email)}`);
      } catch (error) {
        enqueueSnackBar('Email verification failed. Please try again.', {
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

  return null;
};
