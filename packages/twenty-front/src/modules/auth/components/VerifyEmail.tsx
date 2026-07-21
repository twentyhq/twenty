import { SubTitle } from '@/auth/components/SubTitle';
import { VerifyEmailEffect } from '@/auth/components/VerifyEmailEffect';
import { EmailVerificationSent } from '@/auth/sign-in-up/components/EmailVerificationSent';
import { OnboardingVerifyLayout } from '@/onboarding/components/OnboardingVerifyLayout';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ModalContent } from 'twenty-ui/surfaces';

export const VerifyEmail = () => {
  const { t } = useLingui();
  const [searchParams] = useSearchParams();
  const [isError, setIsError] = useState(false);

  const email = searchParams.get('email');

  if (isError) {
    return (
      <ModalContent isVerticallyCentered isHorizontallyCentered>
        <EmailVerificationSent email={email} isError={true} />
      </ModalContent>
    );
  }

  return (
    <>
      <VerifyEmailEffect onError={() => setIsError(true)} />
      <OnboardingVerifyLayout>
        <SubTitle>{t`Verifying your email`}</SubTitle>
      </OnboardingVerifyLayout>
    </>
  );
};
