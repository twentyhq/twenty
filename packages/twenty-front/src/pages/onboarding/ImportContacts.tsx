import { OnboardingCreditsRewardTag } from '@/onboarding/components/import-contacts/OnboardingCreditsRewardTag';
import { OnboardingImportPreview } from '@/onboarding/components/import-contacts/OnboardingImportPreview';
import { OnboardingImportPrivacyNote } from '@/onboarding/components/import-contacts/OnboardingImportPrivacyNote';
import { OnboardingTrustBadges } from '@/onboarding/components/import-contacts/OnboardingTrustBadges';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconGoogle, IconMicrosoft } from 'twenty-ui/icon';
import { MainButton } from 'twenty-ui/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const CONTENT_BLOCK_WIDTH = 340;
const DEFAULT_CREDITS_REWARD = 2;

const StyledPage = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  box-sizing: border-box;
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[14]};
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[16]} ${themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: ${CONTENT_BLOCK_WIDTH}px;
`;

const StyledTitle = styled.h1`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledSubtitle = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  margin: 0;
`;

const StyledCreditsRow = styled.div`
  display: flex;
  padding-top: ${themeCssVariables.spacing[1]};
`;

const StyledMiddle = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[5]};
`;

const StyledFooter = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: ${CONTENT_BLOCK_WIDTH}px;
`;

const StyledButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledSkipButton = styled.button`
  background-color: transparent;
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: ${themeCssVariables.spacing[8]};
  padding: 0 ${themeCssVariables.spacing[5]};
`;

type ImportContactsProps = {
  creditsReward?: number;
  onContinueWithGoogle?: () => void;
  onContinueWithMicrosoft?: () => void;
  onSkip?: () => void;
};

export const ImportContacts = ({
  creditsReward = DEFAULT_CREDITS_REWARD,
  onContinueWithGoogle,
  onContinueWithMicrosoft,
  onSkip,
}: ImportContactsProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <StyledPage>
      <StyledHeading>
        <StyledTitle>{t`Import your contacts`}</StyledTitle>
        <StyledSubtitle>
          {t`Connect your email and calendar to see your entire network instantly. Takes only 30 seconds.`}
        </StyledSubtitle>
        <StyledCreditsRow>
          <OnboardingCreditsRewardTag amount={creditsReward} />
        </StyledCreditsRow>
      </StyledHeading>

      <StyledMiddle>
        <OnboardingTrustBadges />
        <OnboardingImportPreview />
        <OnboardingImportPrivacyNote />
      </StyledMiddle>

      <StyledFooter>
        <StyledButtons>
          {isDefined(onContinueWithMicrosoft) && (
            <MainButton
              title={t`Continue with Microsoft`}
              fullWidth
              onClick={onContinueWithMicrosoft}
              Icon={() => <IconMicrosoft size={theme.icon.size.sm} />}
            />
          )}
          {isDefined(onContinueWithGoogle) && (
            <MainButton
              title={t`Continue with Google`}
              fullWidth
              onClick={onContinueWithGoogle}
              Icon={() => <IconGoogle size={theme.icon.size.sm} />}
            />
          )}
        </StyledButtons>
        {isDefined(onSkip) && (
          <StyledSkipButton type="button" onClick={onSkip}>
            {t`Skip`}
          </StyledSkipButton>
        )}
      </StyledFooter>
    </StyledPage>
  );
};
