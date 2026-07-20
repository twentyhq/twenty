import { StyledOnboardingContentBlock } from '@/onboarding/components/StyledOnboardingContentBlock';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledOnboardingStepHeading = styled(StyledOnboardingContentBlock)`
  gap: ${themeCssVariables.spacing[4]};
`;
