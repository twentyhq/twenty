import { WORKSPACE_ACTIVATION_MESSAGES } from '@/auth/sign-in-up/constants/WorkspaceActivationMessages';
import { StyledOnboardingActivationMessageEmphasis } from '@/onboarding/components/StyledOnboardingActivationMessageEmphasis';
import { type OnboardingActivationMessage } from '@/onboarding/types/OnboardingActivationMessage';
import { Trans } from '@lingui/react/macro';

export const ONBOARDING_ACTIVATION_MESSAGES: OnboardingActivationMessage[] = [
  {
    id: 'verifying-login-token',
    content: (
      <Trans>
        Verifying your{' '}
        <StyledOnboardingActivationMessageEmphasis>
          login token
        </StyledOnboardingActivationMessageEmphasis>
      </Trans>
    ),
  },
  ...WORKSPACE_ACTIVATION_MESSAGES,
];
