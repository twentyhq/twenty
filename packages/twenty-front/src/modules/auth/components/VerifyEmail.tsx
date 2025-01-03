import { useAuth } from '@/auth/hooks/useAuth';
import { SignUpEmailVerification } from '@/auth/sign-in-up/components/SignUpEmailVerification';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export const VerifyEmail = () => {
  const { verifyEmail } = useAuth();
  const { enqueueSnackBar } = useSnackBar();

  const [email, setEmail] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const emailVerificationToken = searchParams.get('emailVerificationToken');

  useEffect(() => {
    const verifyEmailToken = async () => {
      if (!emailVerificationToken) return;

      try {
        const { email } = await verifyEmail(emailVerificationToken);
        setEmail(email);
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

  return <SignUpEmailVerification email={email} />;
};
