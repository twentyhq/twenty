import { useAuth } from '@/auth/hooks/useAuth';
import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

import { useEffect } from 'react';
import {
  Navigate,
  redirect,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { EmailVerificationSent } from '../sign-in-up/components/EmailVerificationSent';

export const VerifyEmail = () => {
  const {
    verifyEmail: { handleVerifyEmail, loading },
  } = useAuth();
  const { enqueueSnackBar } = useSnackBar();

  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const emailVerificationToken = searchParams.get('emailVerificationToken');

  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmailToken = async () => {
      if (!email || !emailVerificationToken) {
        return redirect(AppPath.SignInUp);
      }

      try {
        await handleVerifyEmail(emailVerificationToken);

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

  return <EmailVerificationSent email={email} isError={true} />;
};
