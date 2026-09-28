import { StyledAuthContent } from '@/auth/components/StyledAuthContent';
import { SubTitle } from '@/auth/components/SubTitle';
import { VerifyEmailEffect } from '@/auth/components/VerifyEmailEffect';
import { EmailVerificationSent } from '@/auth/sign-in-up/components/EmailVerificationSent';
import { OnboardingVerifyLayout } from '@/onboarding/components/OnboardingVerifyLayout';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export const VerifyEmail = () => {
  const { t } = useLingui();
  const [searchParams] = useSearchParams();
  const [isError, setIsError] = useState(false);

  const email = searchParams.get('email');

  if (isError) {
    return (
      <StyledAuthContent>
        <EmailVerificationSent email={email} isError={true} />
      </StyledAuthContent>
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
