import { useAuth } from '@/auth/hooks/useAuth';
import { SignUpEmailVerification } from '@/auth/sign-in-up/components/SignUpEmailVerification';
import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-ui';

export const VerifyEmail = () => {
  const { verifyEmail } = useAuth();
  const { enqueueSnackBar } = useSnackBar();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    const navigateToSignIn = () => {
      const params = new URLSearchParams();
      if (isDefined(email)) {
        params.set('email', email);
      }
      navigate(`${AppPath.SignInUp}?${params.toString()}`);
    };

    const verifyEmailToken = async () => {
      if (!token) return;

      try {
        await verifyEmail(token);
        enqueueSnackBar(
          'Email verified successfully. Please login to continue.',
          {
            variant: SnackBarVariant.Success,
          },
        );
        navigateToSignIn();
      } catch (error) {
        enqueueSnackBar('Email verification failed. Please try again.', {
          variant: SnackBarVariant.Error,
        });
      }
    };

    verifyEmailToken();
  }, [token, verifyEmail, enqueueSnackBar, navigate, email]);

  return token ? <></> : <SignUpEmailVerification />;
};
