import { OnboardingSkipButton } from '@/onboarding/components/OnboardingSkipButton';
import { OnboardingStepAnimatedItem } from '@/onboarding/components/OnboardingStepAnimatedItem';
import { StyledOnboardingStepHeading } from '@/onboarding/components/StyledOnboardingStepHeading';
import { StyledOnboardingStepPage } from '@/onboarding/components/StyledOnboardingStepPage';
import { StyledOnboardingStepSubtitle } from '@/onboarding/components/StyledOnboardingStepSubtitle';
import { StyledOnboardingStepTitle } from '@/onboarding/components/StyledOnboardingStepTitle';
import { ONBOARDING_CONTENT_BLOCK_WIDTH } from '@/onboarding/constants/OnboardingContentBlockWidth';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconMessageCircle, IconPencil, IconSearch } from 'twenty-ui/icon';
import { MainButton } from 'twenty-ui/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const StyledOnboardingStep = styled(StyledOnboardingStepPage)`
  gap: ${themeCssVariables.spacing[8]};
`;

const StyledTitleRow = styled.div`
  align-items: center;
  display: flex;
  gap: 10px;
`;

const StyledBetaTag = styled.span`
  align-items: center;
  background-color: ${themeCssVariables.grayScale.gray3};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.pill};
  box-sizing: border-box;
  color: ${themeCssVariables.grayScale.gray10};
  corner-shape: round;
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  height: ${themeCssVariables.spacing[6]};
  line-height: 1.4;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledCard = styled.div`
  background-color: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  width: ${ONBOARDING_CONTENT_BLOCK_WIDTH}px;
`;

const StyledCapabilityRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[3]};
  line-height: 1.4;
  padding: ${themeCssVariables.spacing[4]};

  & + & {
    border-top: 1px solid ${themeCssVariables.border.color.light};
  }
`;

const StyledFooter = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  max-width: 100%;
  width: ${ONBOARDING_CONTENT_BLOCK_WIDTH}px;
`;

const StyledConnectButton = styled.div`
  width: 100%;
`;

type ConnectSlackContentProps = {
  isConnecting: boolean;
  onConnect: () => void;
  onSkip: () => void;
};

export const ConnectSlackContent = ({
  isConnecting,
  onConnect,
  onSkip,
}: ConnectSlackContentProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const capabilities = [
    {
      Icon: IconSearch,
      text: t`Ask about any person, company or deal without leaving Slack`,
    },
    {
      Icon: IconPencil,
      text: t`Create and update records straight from a conversation`,
    },
    {
      Icon: IconMessageCircle,
      text: t`Mention the bot in a channel or send it a direct message`,
    },
  ];

  return (
    <StyledOnboardingStep>
      <StyledOnboardingStepHeading>
        <OnboardingStepAnimatedItem index={0}>
          <StyledTitleRow>
            <StyledOnboardingStepTitle>{t`Bring your CRM into Slack`}</StyledOnboardingStepTitle>
            <StyledBetaTag>{t`Beta`}</StyledBetaTag>
          </StyledTitleRow>
        </OnboardingStepAnimatedItem>
        <OnboardingStepAnimatedItem index={1}>
          <StyledOnboardingStepSubtitle>
            {t`Connect your Slack workspace so your team can ask the assistant about your records.`}
          </StyledOnboardingStepSubtitle>
        </OnboardingStepAnimatedItem>
      </StyledOnboardingStepHeading>

      <OnboardingStepAnimatedItem index={2}>
        <StyledCard>
          {capabilities.map(({ Icon, text }) => (
            <StyledCapabilityRow key={text}>
              <Icon
                size={theme.icon.size.md}
                stroke={theme.icon.stroke.sm}
                color={theme.font.color.tertiary}
              />
              {text}
            </StyledCapabilityRow>
          ))}
        </StyledCard>
      </OnboardingStepAnimatedItem>

      <OnboardingStepAnimatedItem index={3}>
        <StyledFooter>
          <StyledConnectButton>
            <MainButton
              title={t`Add to Slack`}
              onClick={onConnect}
              disabled={isConnecting}
              fullWidth
            />
          </StyledConnectButton>
          <OnboardingSkipButton onClick={onSkip} disabled={isConnecting} />
        </StyledFooter>
      </OnboardingStepAnimatedItem>
    </StyledOnboardingStep>
  );
};
