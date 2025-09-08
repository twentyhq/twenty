import { SettingsBillingLabelValueItem } from '@/billing/components/internal/SettingsBillingLabelValueItem';
import { SubscriptionInfoContainer } from '@/billing/components/SubscriptionInfoContainer';
import { useGetWorkflowNodeExecutionUsage } from '@/billing/hooks/useGetWorkflowNodeExecutionUsage';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { H2Title } from 'twenty-ui/display';
import { ProgressBar } from 'twenty-ui/feedback';
import { Section } from 'twenty-ui/layout';
import { BACKGROUND_LIGHT, COLOR } from 'twenty-ui/theme';
import { SubscriptionStatus } from '~/generated/graphql';
import { formatAmount } from '~/utils/format/formatAmount';
import { formatNumber } from '~/utils/format/number';
import { MeteredPriceSelector } from '@/billing/components/internal/MeteredPriceSelector';
import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import {
  getIntervalLabel,
  isMonthlyPlan,
} from '@/billing/utils/subscriptionFlags';
import { useBillingPlan } from '@/billing/hooks/useBillingPlan';

const StyledLineSeparator = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.background.tertiary};
`;

export const SettingsBillingCreditsSection = ({
  currentWorkspace,
}: {
  currentWorkspace: CurrentWorkspace;
}) => {
  const subscriptionStatus = useSubscriptionStatus();

  const { getCurrentMeteredPricesByInterval } = useBillingPlan();

  const isTrialing = subscriptionStatus === SubscriptionStatus.Trialing;

  const { usedCredits, grantedCredits, unitPriceCents } =
    useGetWorkflowNodeExecutionUsage();

  const progressBarValue = (usedCredits / grantedCredits) * 100;

  const intervalLabel = getIntervalLabel(isMonthlyPlan(currentWorkspace));

  const extraCreditsUsed = Math.max(0, usedCredits - grantedCredits);

  const costPer1kExtraCredits = (unitPriceCents / 100) * 1000;

  const costExtraCredits = (extraCreditsUsed * unitPriceCents) / 100;

  const meteredBillingPrices = getCurrentMeteredPricesByInterval(
    currentWorkspace.currentBillingSubscription?.interval,
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
            value={`${formatNumber(usedCredits, { abbreviate: true })}/${formatAmount(grantedCredits)}`}
          />
          <ProgressBar
            value={progressBarValue}
            barColor={progressBarValue > 100 ? COLOR.red40 : COLOR.blue}
            backgroundColor={BACKGROUND_LIGHT.tertiary}
            withBorderRadius={true}
          />

          <StyledLineSeparator />
          {!isTrialing && (
            <SettingsBillingLabelValueItem
              label={t`Extra Credits Used`}
              value={`${formatAmount(extraCreditsUsed)}`}
            />
          )}
          <SettingsBillingLabelValueItem
            label={t`Cost per 1k Extra Credits`}
            value={`$${formatNumber(costPer1kExtraCredits, 2)}`}
          />
          {!isTrialing && (
            <SettingsBillingLabelValueItem
              label={t`Cost`}
              isValueInPrimaryColor={true}
              value={`$${formatNumber(costExtraCredits, 2)}`}
            />
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
