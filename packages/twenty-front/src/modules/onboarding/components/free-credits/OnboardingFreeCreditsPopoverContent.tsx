import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { type OnboardingCreditsProgress } from '@/onboarding/types/OnboardingCreditsProgress';
import { type OnboardingCreditsStep } from '@/onboarding/types/OnboardingCreditsStep';
import { formatOnboardingCredits } from '@/onboarding/utils/formatOnboardingCredits';
import { getOnboardingCreditWorth } from '@/onboarding/utils/getOnboardingCreditWorth';
import { UsageProgressRow } from '@/ui/feedback/progress-ring/components/UsageProgressRow';
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
        <UsageProgressRow
          Icon={IconCoins}
          label={t`Total earned`}
          value={null}
          valueLabel={plural(earnedCredits, {
            one: `${formattedEarnedCredits} credit`,
            other: `${formattedEarnedCredits} credits`,
          })}
        />
      </StyledSection>
      {isNonEmptyArray(earnedCreditsByStep) && (
        <>
          <HorizontalSeparator noMargin />
          <StyledSection>
            <StyledSectionTitle>{t`Breakdown`}</StyledSectionTitle>
            {earnedCreditsByStep.map(({ step, credits, rewardCredits }) => (
              <UsageProgressRow
                key={step}
                Icon={creditsSteps[step].Icon}
                label={creditsSteps[step].label}
                value={null}
                valueLabel={
                  credits < rewardCredits
                    ? `${formatOnboardingCredits(credits, numberFormat)}/${formatOnboardingCredits(rewardCredits, numberFormat)}`
                    : formatOnboardingCredits(credits, numberFormat)
                }
              />
            ))}
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
        <UsageProgressRow
          Icon={IconSparkles}
          label={t`AI actions`}
          value={null}
          valueLabel={formatNumber(aiActions)}
        />
        <UsageProgressRow
          Icon={IconSettingsAutomation}
          label={t`Workflow steps`}
          value={null}
          valueLabel={formatNumber(workflowSteps)}
        />
        <UsageProgressRow
          Icon={IconWand}
          label={t`Enrichments`}
          value={null}
          valueLabel={formatNumber(enrichments)}
        />
        <UsageProgressRow
          Icon={IconVideo}
          label={t`Call recording`}
          value={null}
          valueLabel={plural(callRecordingHours, {
            one: `${formattedCallRecordingHours} hour`,
            other: `${formattedCallRecordingHours} hours`,
          })}
        />
        <UsageProgressRow
          Icon={IconMail}
          label={t`Shared inbox emails`}
          value={null}
          valueLabel={formatNumber(emailsSent)}
        />
      </StyledSection>
      <HorizontalSeparator noMargin />
      <StyledFooter>
        <IconInfoCircle size={theme.icon.size.sm} />
        {t`Stacks on top of your plan and never expires`}
      </StyledFooter>
    </StyledContent>
  );
};
