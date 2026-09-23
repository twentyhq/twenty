import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { OnboardingSkipButton } from '@/onboarding/components/OnboardingSkipButton';
import { OnboardingStepAnimatedItem } from '@/onboarding/components/OnboardingStepAnimatedItem';
import { StyledOnboardingStepHeading } from '@/onboarding/components/StyledOnboardingStepHeading';
import { StyledOnboardingStepPage } from '@/onboarding/components/StyledOnboardingStepPage';
import { StyledOnboardingStepSubtitle } from '@/onboarding/components/StyledOnboardingStepSubtitle';
import { StyledOnboardingStepTitle } from '@/onboarding/components/StyledOnboardingStepTitle';
import { OnboardingFreeCreditsCtaTag } from '@/onboarding/components/free-credits/OnboardingFreeCreditsCtaTag';
import { OnboardingImportPreview } from '@/onboarding/components/import-contacts/OnboardingImportPreview';
import { OnboardingTrustBadges } from '@/onboarding/components/import-contacts/OnboardingTrustBadges';
import { ONBOARDING_CONTENT_BLOCK_WIDTH } from '@/onboarding/constants/OnboardingContentBlockWidth';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { MainButton } from 'twenty-ui/components';
import { IconGoogle, IconMicrosoft } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const StyledOnboardingStep = styled(StyledOnboardingStepPage)`
  gap: ${themeCssVariables.spacing[8]};
`;

const StyledSubtitle = styled(StyledOnboardingStepSubtitle)`
  max-width: 100%;
  width: 320px;
`;

const StyledMiddle = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledFooter = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  max-width: 100%;
  width: ${ONBOARDING_CONTENT_BLOCK_WIDTH}px;
`;

const StyledButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

type ImportContactsProps = {
  creditsReward?: number;
  onContinueWithGoogle?: () => void;
  onContinueWithMicrosoft?: () => void;
  onSkip?: () => void;
};

export const ImportContacts = ({
  creditsReward,
  onContinueWithGoogle,
  onContinueWithMicrosoft,
  onSkip,
}: ImportContactsProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { formatNumber } = useNumberFormat();

  const creditsTag = isDefined(creditsReward) ? (
    <OnboardingFreeCreditsCtaTag
      label={`+${formatNumber(creditsReward, { decimals: 2 })}`}
    />
  ) : null;

  return (
    <StyledOnboardingStep>
      <StyledOnboardingStepHeading>
        <OnboardingStepAnimatedItem index={0}>
          <StyledOnboardingStepTitle>{t`Import your contacts`}</StyledOnboardingStepTitle>
        </OnboardingStepAnimatedItem>
        <OnboardingStepAnimatedItem index={1}>
          <StyledSubtitle>
            {t`Connect your email and calendar to see your entire network instantly. Takes only 30 seconds.`}
          </StyledSubtitle>
        </OnboardingStepAnimatedItem>
      </StyledOnboardingStepHeading>

      <OnboardingStepAnimatedItem index={2}>
        <StyledMiddle>
          <OnboardingTrustBadges />
          <OnboardingImportPreview />
        </StyledMiddle>
      </OnboardingStepAnimatedItem>

      <OnboardingStepAnimatedItem index={3}>
        <StyledFooter>
          <StyledButtons>
            {isDefined(onContinueWithMicrosoft) && (
              <MainButton
                fullWidth
                onClick={onContinueWithMicrosoft}
                startIcon={<IconMicrosoft size={theme.icon.size.md} />}
              >
                {t`Continue with Microsoft`}
                {creditsTag}
              </MainButton>
            )}
            {isDefined(onContinueWithGoogle) && (
              <MainButton
                fullWidth
                onClick={onContinueWithGoogle}
                startIcon={<IconGoogle size={theme.icon.size.md} />}
              >
                {t`Continue with Google`}
                {creditsTag}
              </MainButton>
            )}
          </StyledButtons>
          {isDefined(onSkip) && <OnboardingSkipButton onClick={onSkip} />}
        </StyledFooter>
      </OnboardingStepAnimatedItem>
    </StyledOnboardingStep>
  );
};
