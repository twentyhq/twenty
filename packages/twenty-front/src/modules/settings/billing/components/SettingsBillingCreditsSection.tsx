import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { MeteredPriceSelector } from '@/settings/billing/components/internal/MeteredPriceSelector';
import { SettingsBillingLabelValueItem } from '@/settings/billing/components/internal/SettingsBillingLabelValueItem';
import { SubscriptionInfoContainer } from '@/settings/billing/components/SubscriptionInfoContainer';
import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import { useCurrentBillingFlags } from '@/settings/billing/hooks/useCurrentBillingFlags';
import { useCurrentMetered } from '@/settings/billing/hooks/useCurrentMetered';
import { useGetWorkflowNodeExecutionUsage } from '@/settings/billing/hooks/useGetWorkflowNodeExecutionUsage';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { formatToShortNumber, getSettingsPath } from 'twenty-shared/utils';
import { H2Title, HorizontalSeparator, IconChartBar } from 'twenty-ui/display';
import { ProgressBar } from 'twenty-ui/feedback';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import {
  FeatureFlagKey,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';

const StyledCreditUsageFooterActions = styled.div`
  margin-top: ${themeCssVariables.spacing[4]};
`;

export const SettingsBillingCreditsSection = ({
  currentBillingSubscription,
}: {
  currentBillingSubscription: NonNullable<
    CurrentWorkspace['currentBillingSubscription']
  >;
}) => {
  const { theme } = useContext(ThemeContext);
  const subscriptionStatus = useSubscriptionStatus();
  const { formatNumber } = useNumberFormat();

  const { isMonthlyPlan } = useCurrentBillingFlags();

  const { getCurrentMeteredPricesByInterval } = useCurrentMetered();

  const isUsageAnalyticsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_USAGE_ANALYTICS_ENABLED,
  );

  const { getIntervalLabel } = useBillingWording();

  const isTrialing = subscriptionStatus === SubscriptionStatus.Trialing;

  const { getWorkflowNodeExecutionUsage } = useGetWorkflowNodeExecutionUsage();

  const {
    usedCredits,
    grantedCredits,
    rolloverCredits,
    totalGrantedCredits,
    unitPriceCents,
  } = getWorkflowNodeExecutionUsage();

  const progressBarValue = (usedCredits / totalGrantedCredits) * 100;
  const displayedProgressBarValue = progressBarValue < 3 ? 3 : progressBarValue;

  const intervalLabel = getIntervalLabel(isMonthlyPlan);

  const extraCreditsUsed = Math.max(0, usedCredits - totalGrantedCredits);

  const costPer1kExtraCredits = (unitPriceCents / 100) * 1000;

  const costExtraCredits = (extraCreditsUsed * unitPriceCents) / 100;

  const meteredBillingPrices = getCurrentMeteredPricesByInterval(
    currentBillingSubscription.interval,
  );

  return (
    <>
      <Section>
        <H2Title
          title={t`Credit Usage`}
          description={t`Track your ${intervalLabel} workflow credit consumption.`}
        />
        <SubscriptionInfoContainer>
          <SettingsBillingLabelValueItem
            label={t`Credits Used`}
            value={`${formatNumber(usedCredits)}/${formatNumber(totalGrantedCredits, { abbreviate: true, decimals: 2 })}`}
          />
          <ProgressBar
            value={displayedProgressBarValue}
            barColor={
              progressBarValue > 100 ? theme.color.red8 : theme.color.blue
            }
            backgroundColor={theme.background.tertiary}
            withBorderRadius={true}
          />

          {!isTrialing && (
            <>
              <HorizontalSeparator noMargin color={theme.background.tertiary} />
              <SettingsBillingLabelValueItem
                label={t`Base Credits`}
                value={formatNumber(grantedCredits, {
                  abbreviate: true,
                  decimals: 2,
                })}
              />
              {rolloverCredits > 0 && (
                <SettingsBillingLabelValueItem
                  label={t`Rollover Credits`}
                  value={formatNumber(rolloverCredits, {
                    abbreviate: true,
                    decimals: 2,
                  })}
                />
              )}
              {rolloverCredits > 0 && (
                <SettingsBillingLabelValueItem
                  label={t`Total Available`}
                  value={formatNumber(totalGrantedCredits, {
                    abbreviate: true,
                    decimals: 2,
                  })}
                />
              )}
              <HorizontalSeparator noMargin color={theme.background.tertiary} />
              <SettingsBillingLabelValueItem
                label={t`Extra Credits Used`}
                value={`${formatToShortNumber(extraCreditsUsed)}`}
              />
              <SettingsBillingLabelValueItem
                label={t`Cost per 1k Extra Credits`}
                value={`$${formatNumber(costPer1kExtraCredits, { abbreviate: true, decimals: 6 })}`}
              />
              <SettingsBillingLabelValueItem
                label={t`Cost`}
                isValueInPrimaryColor={true}
                value={`$${formatNumber(costExtraCredits, { decimals: 2 })}`}
              />
            </>
          )}
        </SubscriptionInfoContainer>

        {isUsageAnalyticsEnabled && (
          <StyledCreditUsageFooterActions>
            <UndecoratedLink to={getSettingsPath(SettingsPath.Usage)}>
              <Button
                Icon={IconChartBar}
                title={t`View usage`}
                variant="secondary"
              />
            </UndecoratedLink>
          </StyledCreditUsageFooterActions>
        )}
      </Section>
      <Section>
        <MeteredPriceSelector
          meteredBillingPrices={meteredBillingPrices}
          isTrialing={isTrialing}
        />
      </Section>
    </>
  );
};
