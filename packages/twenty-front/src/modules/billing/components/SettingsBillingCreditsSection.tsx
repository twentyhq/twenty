import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { MeteredPriceSelector } from '@/billing/components/internal/MeteredPriceSelector';
import { SettingsBillingLabelValueItem } from '@/billing/components/internal/SettingsBillingLabelValueItem';
import { SubscriptionInfoContainer } from '@/billing/components/SubscriptionInfoContainer';
import { useBillingWording } from '@/billing/hooks/useBillingWording';
import { useCurrentBillingFlags } from '@/billing/hooks/useCurrentBillingFlags';
import { useCurrentMetered } from '@/billing/hooks/useCurrentMetered';
import { useGetWorkflowNodeExecutionUsage } from '@/billing/hooks/useGetWorkflowNodeExecutionUsage';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { H2Title } from 'twenty-ui/display';
import { ProgressBar } from 'twenty-ui/feedback';
import { Section } from 'twenty-ui/layout';
import { BACKGROUND_LIGHT } from 'twenty-ui/theme';
import { SubscriptionStatus } from '~/generated/graphql';
import { formatToShortNumber } from '~/utils/format/formatToShortNumber';

const StyledLineSeparator = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.background.tertiary};
`;

export const SettingsBillingCreditsSection = ({
  currentBillingSubscription,
}: {
  currentBillingSubscription: NonNullable<
    CurrentWorkspace['currentBillingSubscription']
  >;
}) => {
  const subscriptionStatus = useSubscriptionStatus();
  const { formatNumber } = useNumberFormat();

  const { isMonthlyPlan } = useCurrentBillingFlags();

  const { getCurrentMeteredPricesByInterval } = useCurrentMetered();

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

  const theme = useTheme();

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
            backgroundColor={BACKGROUND_LIGHT.tertiary}
            withBorderRadius={true}
          />

          {!isTrialing && (
            <>
              <StyledLineSeparator />
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
              <StyledLineSeparator />
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
