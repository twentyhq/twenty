import { VerifyLoginTokenEffect } from '@/auth/components/VerifyLoginTokenEffect';
import { OnboardingActivationSteps } from '@/onboarding/components/OnboardingActivationSteps';
import { OnboardingVerifyLayout } from '@/onboarding/components/OnboardingVerifyLayout';
import { ONBOARDING_ACTIVATION_MESSAGES } from '@/onboarding/constants/OnboardingActivationMessages';

export const Verify = () => (
  <>
    <VerifyLoginTokenEffect />
    <OnboardingVerifyLayout>
      <OnboardingActivationSteps
        messages={ONBOARDING_ACTIVATION_MESSAGES}
        messageIndex={0}
      />
    </OnboardingVerifyLayout>
  </>
);
