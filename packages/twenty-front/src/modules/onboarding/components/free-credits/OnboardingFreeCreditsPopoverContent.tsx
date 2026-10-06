import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { type OnboardingCreditsProgress } from '@/onboarding/types/OnboardingCreditsProgress';
import { type OnboardingCreditsStep } from '@/onboarding/types/OnboardingCreditsStep';
import { formatOnboardingCredits } from '@/onboarding/utils/formatOnboardingCredits';
import { getOnboardingCreditWorth } from '@/onboarding/utils/getOnboardingCreditWorth';
import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import {
  IconApps,
  IconAt,
  IconCoins,
  type IconComponent,
  IconCreditCard,
  IconInfoCircle,
  IconMail,
  IconSettingsAutomation,
  IconSparkles,
  IconUserCircle,
  IconUserPlus,
  IconVideo,
  IconWand,
} from 'twenty-ui/icon';
import { MetricRow } from 'twenty-ui/components/data-display';
import { HorizontalSeparator } from 'twenty-ui/primitives/layout';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  max-width: 100%;
  width: 284px;
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledSectionTitle = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: ${themeCssVariables.spacing[5]};
`;

const StyledFooter = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  min-height: ${themeCssVariables.spacing[6]};
`;

type OnboardingFreeCreditsPopoverContentProps = Pick<
  OnboardingCreditsProgress,
  'earnedCredits' | 'earnedCreditsByStep'
>;

export const OnboardingFreeCreditsPopoverContent = ({
  earnedCredits,
  earnedCreditsByStep,
}: OnboardingFreeCreditsPopoverContentProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { formatNumber, numberFormat } = useNumberFormat();

  const creditsSteps: Record<
    OnboardingCreditsStep,
    { Icon: IconComponent; label: string }
  > = {
    importContacts: { Icon: IconAt, label: t`Import contacts` },
    installApps: { Icon: IconApps, label: t`Install apps` },
    createProfile: { Icon: IconUserCircle, label: t`Create profile` },
    inviteTeam: { Icon: IconUserPlus, label: t`Invite your team` },
    upgradeTrial: { Icon: IconCreditCard, label: t`Upgrade your trial` },
  };

  const {
    aiActions,
    workflowSteps,
    enrichments,
    callRecordingHours,
    emailsSent,
  } = getOnboardingCreditWorth(earnedCredits > 0 ? earnedCredits : 1);

  const formattedEarnedCredits = formatOnboardingCredits(
    earnedCredits,
    numberFormat,
  );
  const formattedCallRecordingHours = formatNumber(callRecordingHours, {
    decimals: 1,
  });

  return (
    <StyledContent>
      <StyledSection>
        <StyledSectionTitle>{t`Free credits`}</StyledSectionTitle>
        <MetricRow
          startIcon={<IconCoins size={14} />}
          value={plural(earnedCredits, {
            one: `${formattedEarnedCredits} credit`,
            other: `${formattedEarnedCredits} credits`,
          })}
        >
          {t`Total earned`}
        </MetricRow>
      </StyledSection>
      {isNonEmptyArray(earnedCreditsByStep) && (
        <>
          <HorizontalSeparator noMargin />
          <StyledSection>
            <StyledSectionTitle>{t`Breakdown`}</StyledSectionTitle>
            {earnedCreditsByStep.map(({ step, credits, rewardCredits }) => {
              const { Icon } = creditsSteps[step];

              return (
                <MetricRow
                  key={step}
                  startIcon={<Icon size={14} />}
                  value={
                    credits < rewardCredits
                      ? `${formatOnboardingCredits(credits, numberFormat)}/${formatOnboardingCredits(rewardCredits, numberFormat)}`
                      : formatOnboardingCredits(credits, numberFormat)
                  }
                >
                  {creditsSteps[step].label}
                </MetricRow>
              );
            })}
          </StyledSection>
        </>
      )}
      <HorizontalSeparator noMargin />
      <StyledSection>
        <StyledSectionTitle>
          {earnedCredits > 0
            ? t`Enough for one of these on average`
            : t`1 credit is enough for one of these on average`}
        </StyledSectionTitle>
        <MetricRow
          startIcon={<IconSparkles size={14} />}
          value={formatNumber(aiActions)}
        >
          {t`AI actions`}
        </MetricRow>
        <MetricRow
          startIcon={<IconSettingsAutomation size={14} />}
          value={formatNumber(workflowSteps)}
        >
          {t`Workflow steps`}
        </MetricRow>
        <MetricRow
          startIcon={<IconWand size={14} />}
          value={formatNumber(enrichments)}
        >
          {t`Enrichments`}
        </MetricRow>
        <MetricRow
          startIcon={<IconVideo size={14} />}
          value={plural(callRecordingHours, {
            one: `${formattedCallRecordingHours} hour`,
            other: `${formattedCallRecordingHours} hours`,
          })}
        >
          {t`Call recording`}
        </MetricRow>
        <MetricRow
          startIcon={<IconMail size={14} />}
          value={formatNumber(emailsSent)}
        >
          {t`Shared inbox emails`}
        </MetricRow>
      </StyledSection>
      <HorizontalSeparator noMargin />
      <StyledFooter>
        <IconInfoCircle size={theme.icon.size.sm} />
        {t`Stacks on top of your plan and never expires`}
      </StyledFooter>
    </StyledContent>
  );
};
