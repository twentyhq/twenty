import { StyledOnboardingActivationMessageEmphasis } from '@/onboarding/components/StyledOnboardingActivationMessageEmphasis';
import { type OnboardingActivationMessage } from '@/onboarding/types/OnboardingActivationMessage';
import { Trans } from '@lingui/react/macro';

export const WORKSPACE_ACTIVATION_MESSAGES: OnboardingActivationMessage[] = [
  {
    id: 'creating-workspace',
    content: (
      <Trans>
        Creating your{' '}
        <StyledOnboardingActivationMessageEmphasis>
          workspace
        </StyledOnboardingActivationMessageEmphasis>
        ...
      </Trans>
    ),
  },
  {
    id: 'setting-up-database',
    content: (
      <Trans>
        Setting up your{' '}
        <StyledOnboardingActivationMessageEmphasis>
          database
        </StyledOnboardingActivationMessageEmphasis>
        ...
      </Trans>
    ),
  },
  {
    id: 'creating-data-model',
    content: (
      <Trans>
        Creating your{' '}
        <StyledOnboardingActivationMessageEmphasis>
          data model
        </StyledOnboardingActivationMessageEmphasis>
        ...
      </Trans>
    ),
  },
  {
    id: 'prefilling-workspace-data',
    content: (
      <Trans>
        Prefilling your{' '}
        <StyledOnboardingActivationMessageEmphasis>
          workspace data
        </StyledOnboardingActivationMessageEmphasis>
        ...
      </Trans>
    ),
  },
];
