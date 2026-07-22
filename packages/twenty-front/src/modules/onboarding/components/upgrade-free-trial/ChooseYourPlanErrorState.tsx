import { useAuth } from '@/auth/hooks/useAuth';
import { OnboardingStepAnimatedItem } from '@/onboarding/components/OnboardingStepAnimatedItem';
import { StyledOnboardingContentBlock } from '@/onboarding/components/StyledOnboardingContentBlock';
import { StyledOnboardingStepHeading } from '@/onboarding/components/StyledOnboardingStepHeading';
import { StyledOnboardingStepPage } from '@/onboarding/components/StyledOnboardingStepPage';
import { StyledOnboardingStepSubtitle } from '@/onboarding/components/StyledOnboardingStepSubtitle';
import { StyledOnboardingStepTitle } from '@/onboarding/components/StyledOnboardingStepTitle';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { MainButton } from 'twenty-ui/input';
import { ClickToActionLink } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledFooter = styled(StyledOnboardingContentBlock)`
  align-items: center;
  gap: ${themeCssVariables.spacing[4]};
`;

type ChooseYourPlanErrorStateProps = {
  onRetry: () => void;
};

export const ChooseYourPlanErrorState = ({
  onRetry,
}: ChooseYourPlanErrorStateProps) => {
  const { t } = useLingui();
  const { signOut } = useAuth();

  return (
    <StyledOnboardingStepPage>
      <StyledOnboardingStepHeading>
        <OnboardingStepAnimatedItem index={0}>
          <StyledOnboardingStepTitle>
            {t`We couldn't load the plans`}
          </StyledOnboardingStepTitle>
        </OnboardingStepAnimatedItem>
        <OnboardingStepAnimatedItem index={1}>
          <StyledOnboardingStepSubtitle>
            {t`Something went wrong while contacting our billing service. Please try again.`}
          </StyledOnboardingStepSubtitle>
        </OnboardingStepAnimatedItem>
      </StyledOnboardingStepHeading>

      <OnboardingStepAnimatedItem index={2}>
        <StyledFooter>
          <MainButton title={t`Try again`} onClick={onRetry} fullWidth />
          <ClickToActionLink onClick={signOut}>
            <Trans>Log out</Trans>
          </ClickToActionLink>
        </StyledFooter>
      </OnboardingStepAnimatedItem>
    </StyledOnboardingStepPage>
  );
};
