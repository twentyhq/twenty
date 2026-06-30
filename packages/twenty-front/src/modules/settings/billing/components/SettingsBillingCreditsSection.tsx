import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { ResourceCreditPriceSelector } from '@/settings/billing/components/internal/ResourceCreditPriceSelector';
import {
  StyledSettingsBillingCard,
  StyledSettingsBillingCardBody,
  StyledSettingsBillingCardHeader,
} from '@/settings/billing/components/internal/SettingsBillingCard';
import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import { useCurrentBillingFlags } from '@/settings/billing/hooks/useCurrentBillingFlags';
import { useCurrentResourceCredit } from '@/settings/billing/hooks/useCurrentResourceCredit';
import { useGetResourceCreditUsage } from '@/settings/billing/hooks/useGetResourceCreditUsage';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { DOCUMENTATION_PATHS } from 'twenty-shared/constants';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  IconChartBar,
  IconCoins,
  IconExternalLink,
  IconInfoCircle,
} from 'twenty-ui/icon';
import { ProgressBar } from 'twenty-ui/feedback';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { ClickToActionLink, UndecoratedLink } from 'twenty-ui/navigation';
import { H2Title } from 'twenty-ui/typography';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  PermissionFlagType,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';

const MIN_VISIBLE_CREDIT_PROGRESS_PERCENTAGE = 4;

const StyledCreditsHeading = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledCreditsHeadingLeft = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCreditsAmount = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  white-space: nowrap;
`;

const StyledCreditsInterval = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  white-space: nowrap;
`;

const StyledCreditsFooter = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-wrap: wrap;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
`;

const StyledCreditsCardBody = styled(StyledSettingsBillingCardBody)`
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]}
    ${themeCssVariables.spacing[3]};
`;

const StyledRolloverText = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 280px;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledUsageMetrics = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  gap: ${themeCssVariables.spacing[2]};
  white-space: nowrap;
`;

const StyledMetricValue = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledCreditUsageFooterActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledExternalLinkButton = styled(ClickToActionLink)`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: 24px;
  padding: 0 ${themeCssVariables.spacing[2]};
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    background: ${themeCssVariables.background.tertiary};
    color: ${themeCssVariables.font.color.secondary};
  }

  &:active {
    background: ${themeCssVariables.background.quaternary};
    color: ${themeCssVariables.font.color.secondary};
  }
`;

export const SettingsBillingCreditsSection = ({
  currentBillingSubscription,
  onUpdatePayment,
  isUpdatePaymentDisabled,
}: {
  currentBillingSubscription: NonNullable<
    CurrentWorkspace['currentBillingSubscription']
  >;
  onUpdatePayment: () => void;
  isUpdatePaymentDisabled: boolean;
}) => {
  const subscriptionStatus = useSubscriptionStatus();
  const { formatNumber } = useNumberFormat();

  const { isMonthlyPlan } = useCurrentBillingFlags();

  const isCancellationScheduled =
    currentBillingSubscription.status !== SubscriptionStatus.Canceled &&
    isDefined(currentBillingSubscription.cancelAt);

  const {
    currentResourceCreditBillingPrice,
    getResourceCreditPricesByInterval,
  } = useCurrentResourceCredit();

  const { getIntervalLabel } = useBillingWording();

  const isTrialing = subscriptionStatus === SubscriptionStatus.Trialing;
  const shouldUpdatePayment =
    subscriptionStatus === SubscriptionStatus.PastDue ||
    subscriptionStatus === SubscriptionStatus.Unpaid;
  const { [PermissionFlagType.WORKSPACE]: hasPermissionToEndTrialPeriod } =
    usePermissionFlagMap();

  const { getResourceCreditUsage } = useGetResourceCreditUsage();

  const { usedCredits, grantedCredits, totalGrantedCredits, rolloverCredits } =
    getResourceCreditUsage();

  const intervalLabel = getIntervalLabel(isMonthlyPlan);
  const packageCredits = currentResourceCreditBillingPrice?.creditAmount;
  const displayedGrantedCredits = packageCredits ?? grantedCredits;

  const remainingCreditsPercentage =
    totalGrantedCredits > 0
      ? ((totalGrantedCredits - usedCredits) / totalGrantedCredits) * 100
      : 0;
  const clampedRemainingCreditsPercentage = Math.min(
    100,
    Math.max(0, remainingCreditsPercentage),
  );
  const isCreditsEmpty = clampedRemainingCreditsPercentage === 0;
  const displayedProgressBarValue = isCreditsEmpty
    ? MIN_VISIBLE_CREDIT_PROGRESS_PERCENTAGE
    : clampedRemainingCreditsPercentage;

  const hasRolloverCredits = rolloverCredits > 0;

  const usedCreditsDisplay = formatNumber(usedCredits, { decimals: 2 });
  const grantedCreditsDisplay = formatNumber(displayedGrantedCredits, {
    decimals: 2,
  });
  const totalGrantedCreditsDisplay = formatNumber(totalGrantedCredits, {
    decimals: 2,
  });
  const rolloverCreditsDisplay = formatNumber(rolloverCredits, {
    decimals: 2,
  });
  const rolloverCapDisplay = formatNumber(displayedGrantedCredits * 2, {
    decimals: 2,
  });
  const remainingCreditsPercentageDisplay = formatNumber(
    clampedRemainingCreditsPercentage,
    { decimals: 0 },
  );

  const resourceCreditPrices = getResourceCreditPricesByInterval(
    currentBillingSubscription.interval,
  );
  const creditsDocumentationUrl = getDocumentationUrl({
    path: DOCUMENTATION_PATHS.USER_GUIDE_BILLING_CAPABILITIES_CREDITS,
  });

  return (
    <Section>
      <H2Title
        title={t`Credits`}
        description={t`Credits are used by workflows, AI chats, agents, and approved apps`}
      />
      <StyledSettingsBillingCard>
        <StyledSettingsBillingCardHeader>
          <StyledCreditsHeadingLeft>
            <IconCoins size={16} color={themeCssVariables.color.green9} />
            <StyledCreditsHeading>
              <StyledCreditsAmount>
                {t`${grantedCreditsDisplay} credits`}
              </StyledCreditsAmount>
              <StyledCreditsInterval>
                {t`/${intervalLabel}`}
              </StyledCreditsInterval>
            </StyledCreditsHeading>
          </StyledCreditsHeadingLeft>
          <ResourceCreditPriceSelector
            resourceCreditPrices={resourceCreditPrices}
            isTrialing={isTrialing}
            shouldRedirectToManageBilling={isCancellationScheduled}
            shouldRedirectToUpdatePayment={shouldUpdatePayment}
            canEndTrialPeriod={hasPermissionToEndTrialPeriod}
            onManageBilling={onUpdatePayment}
            isManageBillingDisabled={isUpdatePaymentDisabled}
            onUpdatePayment={onUpdatePayment}
            isUpdatePaymentDisabled={isUpdatePaymentDisabled}
          />
        </StyledSettingsBillingCardHeader>
        <StyledCreditsCardBody>
          <ProgressBar
            value={displayedProgressBarValue}
            backgroundColor={themeCssVariables.background.tertiary}
            barColor={
              isCreditsEmpty
                ? themeCssVariables.color.red9
                : themeCssVariables.color.green9
            }
            withBorderRadius
          />
          <StyledCreditsFooter>
            {hasRolloverCredits ? (
              <StyledRolloverText>
                <StyledMetricValue>
                  {totalGrantedCreditsDisplay}
                </StyledMetricValue>
                {t`credits available (Including ${rolloverCreditsDisplay} from rollover)`}
              </StyledRolloverText>
            ) : (
              <StyledRolloverText>
                <IconInfoCircle size={14} />
                {t`Unused credits roll over, up to 2× your plan's credits (max ${rolloverCapDisplay}).`}
              </StyledRolloverText>
            )}
            <StyledUsageMetrics>
              <span>
                <StyledMetricValue>{usedCreditsDisplay}</StyledMetricValue>{' '}
                {t`credits used`}
              </span>
              <span>·</span>
              <span>
                <StyledMetricValue>
                  {remainingCreditsPercentageDisplay}
                </StyledMetricValue>{' '}
                {t`% left`}
              </span>
            </StyledUsageMetrics>
          </StyledCreditsFooter>
        </StyledCreditsCardBody>
      </StyledSettingsBillingCard>
      <StyledCreditUsageFooterActions>
        <UndecoratedLink to={getSettingsPath(SettingsPath.Usage)}>
          <Button
            Icon={IconChartBar}
            title={t`View usage`}
            variant="primary"
            size="small"
          />
        </UndecoratedLink>
        <StyledExternalLinkButton
          href={creditsDocumentationUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconExternalLink size={14} />
          <span>{t`How credits work`}</span>
        </StyledExternalLinkButton>
      </StyledCreditUsageFooterActions>
    </Section>
  );
};
