import { StyledOnboardingContentContainer } from '@/auth/components/StyledOnboardingContentContainer';
import { SignInUpWithSaaS } from '@/auth/sign-in-up/components/internal/SignInUpWithSaaS';

export const SignInUpWorkspaceScopeForm = () => {
  return (
    <>
      <StyledOnboardingContentContainer>
        <SignInUpWithSaaS />
      </StyledOnboardingContentContainer>
    </>
  );
};
