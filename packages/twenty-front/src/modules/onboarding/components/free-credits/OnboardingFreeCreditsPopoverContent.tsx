import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { ONBOARDING_CREDIT_WORTH_PER_CREDIT } from '@/onboarding/constants/OnboardingCreditWorthPerCredit';
import { type OnboardingCreditsProgress } from '@/onboarding/types/OnboardingCreditsProgress';
import { UsageProgressRow } from '@/ui/feedback/progress-ring/components/UsageProgressRow';
import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import {
  IconApps,
  IconAt,
  IconBuildingSkyscraper,
  IconCheck,
  IconClock,
  IconCoins,
  IconInfoCircle,
  IconMail,
  IconSettingsAutomation,
  IconSparkles,
  IconUserPlus,
  IconVideo,
  IconWand,
} from 'twenty-ui/icon';
import { HorizontalSeparator } from 'twenty-ui/primitives/layout';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';
import { type OnboardingCreditRewards } from '~/generated-metadata/graphql';

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
  height: 20px;
`;

const StyledEarnedCredits = styled.span`
  color: ${themeCssVariables.color.green9};
`;

const StyledOffer = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

const StyledPending = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledFooter = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  min-height: 24px;
`;

type OnboardingFreeCreditsPopoverContentProps = {
  progress: OnboardingCreditsProgress;
  creditRewards: Omit<OnboardingCreditRewards, '__typename'>;
  onboardingConfig: OnboardingConfig;
};

export const OnboardingFreeCreditsPopoverContent = ({
  progress,
  creditRewards,
  onboardingConfig,
}: OnboardingFreeCreditsPopoverContentProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { formatNumber } = useNumberFormat();

  const { earnedCredits, visibleSteps } = progress;
  const {
    importContactsCredits,
    installAppsCredits,
    inviteTeamCredits,
    enrichmentQualificationCredits,
    pendingInvitationsCount,
  } = creditRewards;

  const formatCredits = (credits: number) =>
    formatNumber(credits, { decimals: 2 });

  const worthBaseCredits = earnedCredits > 0 ? earnedCredits : 1;
  const formatWorth = (worthPerCredit: number) =>
    formatNumber(Math.floor(worthPerCredit * worthBaseCredits));
  const callRecordingHours =
    Math.round(
      ONBOARDING_CREDIT_WORTH_PER_CREDIT.callRecordingHours *
        worthBaseCredits *
        10,
    ) / 10;

  const renderEarnedCredits = (credits: number) => (
    <StyledEarnedCredits>{`+${formatCredits(credits)}`}</StyledEarnedCredits>
  );

  const formattedInstallAppsReward = formatCredits(
    onboardingConfig.installAppsCreditsRewardPerApp,
  );
  const formattedInviteTeamReward = formatCredits(
    onboardingConfig.inviteTeamCreditsRewardPerUser,
  );

  return (
    <StyledContent>
      <StyledSection>
        <StyledSectionTitle>{t`Free credits`}</StyledSectionTitle>
        <UsageProgressRow
          Icon={IconCoins}
          label={t`Balance`}
          value={null}
          valueLabel={plural(earnedCredits, {
            one: '# credit',
            other: '# credits',
          })}
        />
      </StyledSection>
      <HorizontalSeparator noMargin />
      <StyledSection>
        <StyledSectionTitle>
          {earnedCredits > 0
            ? t`Worth on average`
            : t`1 credit is worth on average`}
        </StyledSectionTitle>
        <UsageProgressRow
          Icon={IconSparkles}
          label={t`AI actions`}
          value={null}
          valueLabel={formatWorth(ONBOARDING_CREDIT_WORTH_PER_CREDIT.aiActions)}
        />
        <UsageProgressRow
          Icon={IconSettingsAutomation}
          label={t`Workflow steps`}
          value={null}
          valueLabel={formatWorth(
            ONBOARDING_CREDIT_WORTH_PER_CREDIT.workflowSteps,
          )}
        />
        <UsageProgressRow
          Icon={IconWand}
          label={t`Enrichments`}
          value={null}
          valueLabel={formatWorth(
            ONBOARDING_CREDIT_WORTH_PER_CREDIT.enrichments,
          )}
        />
        <UsageProgressRow
          Icon={IconVideo}
          label={t`Call recording`}
          value={null}
          valueLabel={plural(callRecordingHours, {
            one: '# hour',
            other: '# hours',
          })}
        />
        <UsageProgressRow
          Icon={IconMail}
          label={t`Emails sent`}
          value={null}
          valueLabel={formatWorth(
            ONBOARDING_CREDIT_WORTH_PER_CREDIT.emailsSent,
          )}
        />
      </StyledSection>
      <HorizontalSeparator noMargin />
      <StyledSection>
        <StyledSectionTitle>{t`Earn more`}</StyledSectionTitle>
        {visibleSteps.includes('importContacts') && (
          <UsageProgressRow
            Icon={importContactsCredits > 0 ? IconCheck : IconAt}
            label={t`Connect your email`}
            value={null}
            valueLabel={
              importContactsCredits > 0 ? (
                renderEarnedCredits(importContactsCredits)
              ) : (
                <StyledOffer>{`+${formatCredits(
                  onboardingConfig.importContactsCreditsReward,
                )}`}</StyledOffer>
              )
            }
          />
        )}
        {visibleSteps.includes('installApps') && (
          <UsageProgressRow
            Icon={installAppsCredits > 0 ? IconCheck : IconApps}
            label={t`Install apps`}
            value={null}
            valueLabel={
              installAppsCredits > 0 ? (
                renderEarnedCredits(installAppsCredits)
              ) : (
                <StyledOffer>{t`+${formattedInstallAppsReward} each`}</StyledOffer>
              )
            }
          />
        )}
        {visibleSteps.includes('inviteTeam') && (
          <UsageProgressRow
            Icon={IconUserPlus}
            label={t`Invite teammates`}
            value={null}
            valueLabel={
              inviteTeamCredits > 0 ? (
                renderEarnedCredits(inviteTeamCredits)
              ) : pendingInvitationsCount > 0 ? (
                <StyledPending>
                  <IconClock size={theme.icon.size.sm} />
                  {plural(pendingInvitationsCount, {
                    one: '# invite pending',
                    other: '# invites pending',
                  })}
                </StyledPending>
              ) : (
                <StyledOffer>{t`+${formattedInviteTeamReward} each`}</StyledOffer>
              )
            }
          />
        )}
        {enrichmentQualificationCredits > 0 && (
          <UsageProgressRow
            Icon={IconBuildingSkyscraper}
            label={t`Company bonus`}
            value={null}
            valueLabel={renderEarnedCredits(enrichmentQualificationCredits)}
          />
        )}
      </StyledSection>
      <HorizontalSeparator noMargin />
      <StyledFooter>
        <IconInfoCircle size={theme.icon.size.sm} />
        {t`Stacks on top of your plan and never expires`}
      </StyledFooter>
    </StyledContent>
  );
};
