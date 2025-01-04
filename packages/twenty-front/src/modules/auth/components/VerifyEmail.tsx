import { useAuth } from '@/auth/hooks/useAuth';
import { SignUpEmailVerification } from '@/auth/sign-in-up/components/SignUpEmailVerification';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export const VerifyEmail = () => {
  const { verifyEmail } = useAuth();
  const { enqueueSnackBar } = useSnackBar();

  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const emailVerificationToken = searchParams.get('emailVerificationToken');

  useEffect(() => {
    const verifyEmailToken = async () => {
      if (!emailVerificationToken) return;

      try {
        await verifyEmail(emailVerificationToken);
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

  return (
    <SignUpEmailVerification email={email} isEmailVerified={isEmailVerified} />
  );
};
